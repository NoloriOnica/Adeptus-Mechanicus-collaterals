import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { TabletPage } from './pages/TabletPage';

function generateSessionId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function AutoRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/display/${generateSessionId()}`, { replace: true });
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/display/:sessionId" element={<TabletPage />} />
      <Route path="/display" element={<AutoRedirect />} />
      <Route path="/" element={<Navigate to={`/display/${generateSessionId()}`} replace />} />
      <Route path="*" element={<Navigate to={`/display/${generateSessionId()}`} replace />} />
    </Routes>
  );
}
