import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CareGuidesPage } from './pages/CareGuidesPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/guides" element={<CareGuidesPage />} />
          <Route path="/care" element={<Navigate to="/guides" replace />} />
          <Route path="/care-and-guides" element={<Navigate to="/guides" replace />} />
          <Route path="/login" element={<AuthPage defaultRegister={false} />} />
          <Route path="/register" element={<AuthPage defaultRegister={true} />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
