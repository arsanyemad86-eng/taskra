import { NavLink } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';


const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/notes', label: 'Notes' },
  { to: '/goals', label: 'Goals' },
  { to: '/pomodoro', label: 'Pomodoro' },
  { to: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <span aria-hidden="true">⚡</span>
        <span>Taskra</span>
      </div>

      <nav className="navbar-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `navbar-link${isActive ? ' active' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="navbar-greeting">
        Hey, {user?.name} <span aria-hidden="true">👋</span>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

    </header>
  );
}
