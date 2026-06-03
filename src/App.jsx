import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tasks from './pages/Tasks.jsx';
import Notes from './pages/Notes.jsx';
import Goals from './pages/Goals.jsx';
import Pomodoro from './pages/Pomodoro.jsx';
import Login from './pages/Login.jsx';
import './App.css';
import Settings from './pages/Settings.jsx';

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Login />;

  return (
    <div className="app">
      <Navbar />
      <main className="app-main">
        <div className="page" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
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