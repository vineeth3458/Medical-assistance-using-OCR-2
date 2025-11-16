import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import "@/App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// API Helper
const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Landing Page Component
function LandingPage() {
  const handleLogin = () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"></div>

      {/* Navbar */}
      <nav className="relative z-10 glass-effect">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">ARI Detect</span>
          </div>
          <button
            data-testid="login-button"
            onClick={handleLogin}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Doctor Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Powered <span className="bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">Respiratory Infection</span> Detection
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Advanced Vision Transformer technology analyzes chest X-rays to detect acute respiratory infections with exceptional accuracy. Get instant AI-powered diagnoses and comprehensive medical reports.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                data-testid="get-started-button"
                onClick={handleLogin}
                className="px-8 py-4 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-sky-500 hover:shadow-lg transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="glass-effect rounded-3xl p-8 shadow-2xl">
              <div className="bg-gradient-to-br from-sky-100 to-teal-100 rounded-2xl p-8 aspect-square flex items-center justify-center">
                <svg className="w-64 h-64 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-sky-600">95%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">&lt;30s</div>
                  <div className="text-sm text-gray-600">Analysis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">AI</div>
                  <div className="text-sm text-gray-600">Powered</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="glass-effect rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Vision Transformer AI</h3>
            <p className="text-gray-600 leading-relaxed">State-of-the-art deep learning model trained on thousands of X-ray images for precise detection.</p>
          </div>

          <div className="glass-effect rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI-Generated Reports</h3>
            <p className="text-gray-600 leading-relaxed">Comprehensive medical reports generated using GPT-5 with clinical recommendations.</p>
          </div>

          <div className="glass-effect rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Patient Management</h3>
            <p className="text-gray-600 leading-relaxed">Track patient records, history, and analysis results in a secure dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('patients'); // patients, analyze, history
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [xrayFile, setXrayFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchPatients();
    fetchAnalyses();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const response = await api.get('/analyses');
      setAnalyses(response.data);
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('session_token');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post('/patients', {
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        medical_history: formData.get('medical_history')
      });
      toast.success('Patient created successfully');
      setShowPatientForm(false);
      fetchPatients();
    } catch (error) {
      toast.error('Failed to create patient');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPatient || !xrayFile) {
      toast.error('Please select a patient and upload an X-ray image');
      return;
    }

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', xrayFile);
      formData.append('patient_id', selectedPatient);

      const response = await api.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAnalysisResult(response.data);
      toast.success('Analysis completed successfully');
      fetchAnalyses();
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadReport = (analysis) => {
    // Create PDF report
    const reportContent = `
ARI DETECTION SYSTEM - MEDICAL REPORT

Analysis ID: ${analysis.id}
Patient: ${analysis.patient_name}
Date: ${new Date(analysis.created_at).toLocaleDateString()}

DIAGNOSIS:
${analysis.prediction}

Confidence: ${(analysis.confidence * 100).toFixed(2)}%

MEDICAL REPORT:
${analysis.report}

This is an AI-generated report. Please consult with a medical professional for final diagnosis.
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ARI_Report_${analysis.id}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50">
      {/* Navbar */}
      <nav className="glass-effect border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">ARI Detect</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2" data-testid="user-profile">
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
              )}
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <button
              data-testid="logout-button"
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            data-testid="patients-tab"
            onClick={() => setView('patients')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              view === 'patients'
                ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Patients
          </button>
          <button
            data-testid="analyze-tab"
            onClick={() => setView('analyze')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              view === 'analyze'
                ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Analyze X-Ray
          </button>
          <button
            data-testid="history-tab"
            onClick={() => setView('history')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              view === 'history'
                ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            History
          </button>
        </div>

        {/* Patients View */}
        {view === 'patients' && (
          <div data-testid="patients-view">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Patients</h2>
              <button
                data-testid="add-patient-button"
                onClick={() => setShowPatientForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                + Add Patient
              </button>
            </div>

            {showPatientForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="patient-form-modal">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                  <h3 className="text-2xl font-bold mb-6">New Patient</h3>
                  <form onSubmit={handleCreatePatient} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        data-testid="patient-name-input"
                        name="name"
                        type="text"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Age</label>
                      <input
                        data-testid="patient-age-input"
                        name="age"
                        type="number"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Gender</label>
                      <select
                        data-testid="patient-gender-select"
                        name="gender"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Medical History</label>
                      <textarea
                        data-testid="patient-history-textarea"
                        name="medical_history"
                        rows="3"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      ></textarea>
                    </div>
                    <div className="flex gap-3">
                      <button
                        data-testid="save-patient-button"
                        type="submit"
                        className="flex-1 py-2 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-lg font-medium"
                      >
                        Save
                      </button>
                      <button
                        data-testid="cancel-patient-button"
                        type="button"
                        onClick={() => setShowPatientForm(false)}
                        className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="patients-grid">
              {patients.map((patient) => (
                <div key={patient.id} className="glass-effect rounded-xl p-6 hover:shadow-xl transition-shadow" data-testid={`patient-card-${patient.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">{patient.age} years • {patient.gender}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-teal-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  {patient.medical_history && (
                    <p className="text-sm text-gray-600 line-clamp-2">{patient.medical_history}</p>
                  )}
                </div>
              ))}
              {patients.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500" data-testid="no-patients-message">
                  No patients added yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analyze View */}
        {view === 'analyze' && (
          <div data-testid="analyze-view">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Analyze X-Ray</h2>
            <div className="glass-effect rounded-2xl p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Patient</label>
                  <select
                    data-testid="patient-select"
                    value={selectedPatient || ''}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.age} years)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Upload Chest X-Ray</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      data-testid="xray-file-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setXrayFile(e.target.files[0])}
                      className="hidden"
                      id="xray-upload"
                    />
                    <label htmlFor="xray-upload" className="cursor-pointer">
                      <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">
                        {xrayFile ? xrayFile.name : 'Click to upload X-ray image'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 50MB</p>
                    </label>
                  </div>
                </div>

                <button
                  data-testid="analyze-button"
                  onClick={handleAnalyze}
                  disabled={analyzing || !selectedPatient || !xrayFile}
                  className="w-full py-4 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-lg font-semibold text-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze X-Ray'}
                </button>
              </div>

              {analysisResult && (
                <div className="mt-8 border-t pt-8" data-testid="analysis-result">
                  <h3 className="text-2xl font-bold mb-6">Analysis Results</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-sky-50 to-teal-50 rounded-xl p-6">
                      <div className="text-sm text-gray-600 mb-2">Primary Finding</div>
                      <div className="text-3xl font-bold text-gray-900" data-testid="prediction-result">{analysisResult.prediction}</div>
                      <div className="text-sm text-gray-600 mt-2">Confidence: <span className="font-semibold">{(analysisResult.confidence * 100).toFixed(2)}%</span></div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border">
                      <div className="text-sm text-gray-600 mb-3">X-Ray Image</div>
                      <img
                        src={`data:image/jpeg;base64,${analysisResult.image_data}`}
                        alt="X-ray"
                        className="w-full rounded-lg"
                        data-testid="xray-preview"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border">
                    <h4 className="font-bold text-lg mb-3">Medical Report</h4>
                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap" data-testid="medical-report">
                      {analysisResult.report}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History View */}
        {view === 'history' && (
          <div data-testid="history-view">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Analysis History</h2>
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="glass-effect rounded-xl p-6 hover:shadow-xl transition-shadow" data-testid={`analysis-card-${analysis.id}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{analysis.patient_name}</h3>
                        <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                          {analysis.prediction}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(analysis.created_at).toLocaleDateString()} • Confidence: {(analysis.confidence * 100).toFixed(2)}%
                      </p>
                      <p className="mt-3 text-gray-700 line-clamp-2">{analysis.report}</p>
                    </div>
                    <button
                      data-testid={`download-report-${analysis.id}`}
                      onClick={() => downloadReport(analysis)}
                      className="ml-4 px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              ))}
              {analyses.length === 0 && (
                <div className="text-center py-12 text-gray-500" data-testid="no-analyses-message">
                  No analyses yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

// Session Handler
function SessionHandler() {
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('session_id=')) {
      const sessionId = hash.split('session_id=')[1].split('&')[0];
      processSession(sessionId);
    } else {
      // Check if already logged in
      const token = localStorage.getItem('session_token');
      if (token) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/';
      }
    }
  }, []);

  const processSession = async (sessionId) => {
    try {
      const response = await api.post('/auth/session', { session_id: sessionId });
      localStorage.setItem('session_token', response.data.session_token);
      // Clear URL hash
      window.history.replaceState(null, '', '/dashboard');
      window.location.reload();
    } catch (error) {
      console.error('Session processing failed:', error);
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}

// Protected Route
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('session_token');
  return token ? children : <Navigate to="/" />;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              window.location.hash.includes('session_id=') ? (
                <SessionHandler />
              ) : (
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
