import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Components
import Navbar from './components/Navbar';
import PatientRoute from './components/PatientRoute';
import ProviderRoute from './components/ProviderRoute';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientGoals from './pages/patient/Goals';
import PatientProfile from './pages/patient/Profile';

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderPatientDetail from './pages/provider/PatientDetail';
import ProviderProfile from './pages/provider/Profile';

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Patient Routes */}
                <Route path="/patient" element={<PatientRoute />}>
                  <Route path="dashboard" element={<PatientDashboard />} />
                  <Route path="goals" element={<PatientGoals />} />
                  <Route path="profile" element={<PatientProfile />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>
                
                {/* Provider Routes */}
                <Route path="/provider" element={<ProviderRoute />}>
                  <Route path="dashboard" element={<ProviderDashboard />} />
                  <Route path="patient/:id" element={<ProviderPatientDetail />} />
                  <Route path="profile" element={<ProviderProfile />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
