import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PhonePage } from './pages/PhonePage';

function generateSessionId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function AutoRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/phone/${generateSessionId()}`, { replace: true });
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/phone/:sessionId" element={<PhonePage />} />
      <Route path="/phone" element={<AutoRedirect />} />
      <Route path="/" element={<Navigate to={`/phone/${generateSessionId()}`} replace />} />
      <Route path="*" element={<Navigate to={`/phone/${generateSessionId()}`} replace />} />
    </Routes>
  );
}
