import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tasks from './pages/Tasks.jsx';
import Notes from './pages/Notes.jsx';
import Goals from './pages/Goals.jsx';
import Pomodoro from './pages/Pomodoro.jsx';
import './App.css';

export default function App() {
  const location = useLocation();

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
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
