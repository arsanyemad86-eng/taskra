import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const links = [
  { to: '/', label: 'Dashboard', icon: '◆' },
  { to: '/tasks', label: 'Tasks', icon: '✓' },
  { to: '/notes', label: 'Notes', icon: '✎' },
  { to: '/goals', label: 'Goals', icon: '◎' },
  { to: '/pomodoro', label: 'Pomodoro', icon: '◷' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-bolt" aria-hidden="true">⚡</span>
        <span className="logo-text">Taskra</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-greeting">
          Hey, Arsany <span aria-hidden="true">👋</span>
        </div>
        <div className="sidebar-tagline">Build. Focus. Compound.</div>
      </div>
    </aside>
  );
}
