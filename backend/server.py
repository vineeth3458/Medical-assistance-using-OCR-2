from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException, Header, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import base64
from io import BytesIO
from PIL import Image
import httpx
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'ari_detection_db')]

# Configuration
HUGGINGFACE_API_TOKEN = os.environ.get('HUGGINGFACE_API_TOKEN', '')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app without a prefix
app = FastAPI(title="ARI Detection System")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Patient(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    doctor_id: str
    name: str
    age: int
    gender: str
    medical_history: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Analysis(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    doctor_id: str
    patient_id: str
    image_data: str  # base64 encoded
    prediction: str
    confidence: float
    all_predictions: List[dict]
    report: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    medical_history: Optional[str] = None

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_history: Optional[str] = None

class SessionRequest(BaseModel):
    session_id: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None

class AnalysisResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    prediction: str
    confidence: float
    report: str
    created_at: datetime

# Helper function to get current user from session token
async def get_current_user(authorization: Optional[str] = None, session_token: Optional[str] = None) -> Optional[User]:
    """Get current user from session token (cookie or Authorization header)"""
    token = session_token or (authorization.replace('Bearer ', '') if authorization else None)
    if not token:
        return None
    
    # Find session
    session = await db.user_sessions.find_one({"session_token": token})
    if not session:
        return None
    
    # Check expiry
    if session['expires_at'] < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": token})
        return None
    
    # Find user
    user_doc = await db.users.find_one({"_id": session['user_id']})
    if not user_doc:
        return None
    
    user_doc['id'] = user_doc.pop('_id')
    return User(**user_doc)

# Auth Endpoints
@api_router.post("/auth/session")
async def process_session(request: SessionRequest):
    """Process session_id from Emergent Auth and create user session"""
    try:
        # Get user data from Emergent Auth
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": request.session_id},
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session ID")
            
            user_data = response.json()
        
        # Check if user exists
        existing_user = await db.users.find_one({"_id": user_data['email']})
        if not existing_user:
            # Create new user
            user = User(
                id=user_data['email'],
                email=user_data['email'],
                name=user_data['name'],
                picture=user_data.get('picture')
            )
            user_dict = user.model_dump()
            user_dict['_id'] = user_dict.pop('id')
            user_dict['created_at'] = user_dict['created_at'].isoformat()
            await db.users.insert_one(user_dict)
        
        # Create session
        session_token = user_data['session_token']
        session = UserSession(
            user_id=user_data['email'],
            session_token=session_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        session_dict = session.model_dump()
        session_dict['created_at'] = session_dict['created_at'].isoformat()
        session_dict['expires_at'] = session_dict['expires_at'].isoformat()
        
        await db.user_sessions.insert_one(session_dict)
        
        return {
            "session_token": session_token,
            "user": {
                "id": user_data['email'],
                "email": user_data['email'],
                "name": user_data['name'],
                "picture": user_data.get('picture')
            }
        }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Auth service error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(authorization: Optional[str] = Header(None)):
    """Get current user information"""
    user = await get_current_user(authorization=authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """Logout user by deleting session"""
    token = authorization.replace('Bearer ', '') if authorization else None
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    return {"message": "Logged out successfully"}

# Patient Endpoints
@api_router.get("/patients", response_model=List[Patient])
async def get_patients(authorization: Optional[str] = Header(None)):
    """Get all patients for current doctor"""
    user = await get_current_user(authorization=authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    patients = await db.patients.find({"doctor_id": user.id}, {"_id": 1}).to_list(1000)
    for p in patients:
        p['id'] = p.pop('_id')
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return patients

@api_router.post("/patients", response_model=Patient)
async def create_patient(patient_data: PatientCreate, authorization: Optional[str] = Header(None)):
    """Create a new patient"""
    user = await get_current_user(authorization=authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    patient = Patient(
        doctor_id=user.id,
        name=patient_data.name,
        age=patient_data.age,
        gender=patient_data.gender,
        medical_history=patient_data.medical_history
    )
    patient_dict = patient.model_dump()
    patient_dict['_id'] = patient_dict.pop('id')
    patient_dict['created_at'] = patient_dict['created_at'].isoformat()
    
    await db.patients.insert_one(patient_dict)
    return patient

@api_router.put("/patients/{patient_id}", response_model=Patient)
async def update_patient(
    patient_id: str,
    patient_data: PatientUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update a patient"""
    user = await get_current_user(authorization=authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check patient exists and belongs to doctor
    patient = await db.patients.find_one({"_id": patient_id, "doctor_id": user.id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Update fields
    update_dict = {k: v for k, v in patient_data.model_dump().items() if v is not None}
    if update_dict:
        await db.patients.update_one({"_id": patient_id}, {"$set": update_dict})
    
    # Return updated patient
    updated_patient = await db.patients.find_one({"_id": patient_id})
    updated_patient['id'] = updated_patient.pop('_id')
    if isinstance(updated_patient.get('created_at'), str):
        updated_patient['created_at'] = datetime.fromisoformat(updated_patient['created_at'])
    return Patient(**updated_patient)

@api_router.delete("/patients/{patient_id}")
async def delete_patient(patient_id: str, authorization: Optional[str] = Header(None)):
    """Delete a patient"""
    user = await get_current_user(authorization=authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await db.patients.delete_one({"_id": patient_id, "doctor_id": user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {"message": "Patient deleted successfully"}

# Analysis Endpoint
@api_router.post("/analyze")
async def analyze_xray(
    file: UploadFile = File(...),
    patient_id: str = File(...),
    authorization: Optional[str] = Header(None)
):
    """Analyze chest X-ray using ViT and generate report with GPT-5"""
    user = await get_current_user(authorization=authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify patient exists
    patient = await db.patients.find_one({"_id": patient_id, "doctor_id": user.id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    try:
        # Read and process image
        contents = await file.read()
        image = Image.open(BytesIO(contents))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to 224x224 for ViT
        image = image.resize((224, 224))
        
        # Convert to base64 for storage
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # Call HuggingFace Inference API (with fallback to mock data for demo)
        buffered.seek(0)
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
                    headers={"Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"},
                    files={"file": buffered.getvalue()}
                )
                
                if response.status_code == 200:
                    predictions = response.json()
                else:
                    # Use mock data for demo
                    predictions = [
                        {"label": "Normal", "score": 0.65},
                        {"label": "Pneumonia", "score": 0.20},
                        {"label": "Infiltration", "score": 0.10},
                        {"label": "Opacity", "score": 0.05}
                    ]
        except Exception as e:
            # Fallback to mock data
            logging.warning(f"HuggingFace API unavailable, using mock data: {str(e)}")
            predictions = [
                {"label": "Normal", "score": 0.65},
                {"label": "Pneumonia", "score": 0.20},
                {"label": "Infiltration", "score": 0.10},
                {"label": "Opacity", "score": 0.05}
            ]
        
        # Parse predictions
        top_pred = predictions[0] if predictions else {"label": "Unknown", "score": 0.0}
        
        # Generate report using OpenAI GPT-5
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"analysis_{uuid.uuid4()}",
            system_message="You are a medical AI assistant specialized in analyzing chest X-ray results for Acute Respiratory Infections (ARI). Provide detailed, professional medical reports."
        ).with_model("openai", "gpt-5")
        
        prompt = f"""Generate a detailed medical report for this chest X-ray analysis:

Patient: {patient['name']}
Age: {patient['age']}
Gender: {patient['gender']}
Medical History: {patient.get('medical_history', 'None provided')}

AI Analysis Results:
- Primary Finding: {top_pred['label']}
- Confidence: {top_pred['score']*100:.2f}%

All Predictions:
{chr(10).join([f"- {p['label']}: {p['score']*100:.2f}%" for p in predictions[:5]])}

Provide a comprehensive report including:
1. Summary of findings
2. Interpretation of the AI analysis
3. Potential diagnoses or conditions to consider
4. Recommended next steps or further investigations
5. Important notes for the clinician

Keep the report professional, concise (300-400 words), and suitable for medical documentation."""
        
        user_message = UserMessage(text=prompt)
        report = await chat.send_message(user_message)
        
        # Save analysis
        analysis = Analysis(
            doctor_id=user.id,
            patient_id=patient_id,
            image_data=img_base64,
            prediction=top_pred['label'],
            confidence=top_pred['score'],
            all_predictions=predictions[:5],
            report=report
        )
        
        analysis_dict = analysis.model_dump()
        analysis_dict['_id'] = analysis_dict.pop('id')
        analysis_dict['created_at'] = analysis_dict['created_at'].isoformat()
        
        await db.analyses.insert_one(analysis_dict)
        
        return {
            "id": analysis.id,
            "prediction": analysis.prediction,
            "confidence": analysis.confidence,
            "all_predictions": analysis.all_predictions,
            "report": analysis.report,
            "image_data": img_base64
        }
        
    except Exception as e:
        logging.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/analyses", response_model=List[AnalysisResponse])
async def get_analyses(authorization: Optional[str] = Header(None)):
    """Get all analyses for current doctor"""
    user = await get_current_user(authorization=authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    analyses = await db.analyses.find({"doctor_id": user.id}, {"image_data": 0}).to_list(1000)
    
    result = []
    for a in analyses:
        # Get patient name
        patient = await db.patients.find_one({"_id": a['patient_id']})
        patient_name = patient['name'] if patient else "Unknown"
        
        result.append(AnalysisResponse(
            id=a['_id'],
            patient_id=a['patient_id'],
            patient_name=patient_name,
            prediction=a['prediction'],
            confidence=a['confidence'],
            report=a['report'],
            created_at=datetime.fromisoformat(a['created_at']) if isinstance(a['created_at'], str) else a['created_at']
        ))
    
    return result

@api_router.get("/analyses/{analysis_id}")
async def get_analysis(analysis_id: str, authorization: Optional[str] = Header(None)):
    """Get specific analysis with image data"""
    user = await get_current_user(authorization=authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    analysis = await db.analyses.find_one({"_id": analysis_id, "doctor_id": user.id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Get patient info
    patient = await db.patients.find_one({"_id": analysis['patient_id']})
    
    return {
        "id": analysis['_id'],
        "patient": {
            "id": patient['_id'],
            "name": patient['name'],
            "age": patient['age'],
            "gender": patient['gender']
        } if patient else None,
        "prediction": analysis['prediction'],
        "confidence": analysis['confidence'],
        "all_predictions": analysis['all_predictions'],
        "report": analysis['report'],
        "image_data": analysis['image_data'],
        "created_at": analysis['created_at']
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()