import { useState } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { useKeyboardShortcuts, SHORTCUTS } from './hooks/useKeyboardShortcuts.ts';
import Navbar from './components/Navbar.tsx';
import Onboarding from './components/Onboarding.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Tasks from './pages/Tasks.tsx';
import Notes from './pages/Notes.tsx';
import Goals from './pages/Goals.tsx';
import Analytics from './pages/Analytics.tsx';
import Pomodoro from './pages/Pomodoro.tsx';
import Login from './pages/Login.tsx';
import './App.css';
import Settings from './pages/Settings.tsx';

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem('taskra_onboarded') === 'true'
  );

  useKeyboardShortcuts(navigate, {
    onHelp: () => setShowShortcuts((v) => !v),
  });

  if (!user) return <Login />;

  if (!onboarded) {
    return <Onboarding onFinish={() => setOnboarded(true)} />;
  }

  return (
    <div className="app">
      <Navbar />
      <main className="app-main">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </main>

      {showShortcuts && (
        <div className="modal-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Keyboard Shortcuts</h2>
            <table className="shortcuts-table">
              <tbody>
                {SHORTCUTS.map((s) => (
                  <tr key={s.keys}>
                    <td>
                      <kbd className="shortcut-key">{s.keys}</kbd>
                    </td>
                    <td>{s.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={() => setShowShortcuts(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
