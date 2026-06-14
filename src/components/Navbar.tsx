import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

// NavItem: شكل كل عنصر في قايمة الروابط. تعريفه بيمنع أي عنصر
// ناقصه `to` أو `label` (أو فيه خطأ إملائي في اسم الخاصية) من
// المرور بصمت - TypeScript هيشتكي وقت كتابة الـ array نفسه.
interface NavItem {
  to: string;
  label: string;
}

const links: NavItem[] = [
  { to: '/', label: 'Dashboard' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/notes', label: 'Notes' },
  { to: '/goals', label: 'Goals' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/pomodoro', label: 'Pomodoro' },
  { to: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const { user, logout } = useAuth();

  // useState<boolean> هنا توضيحي بشكل أساسي - TypeScript كان هيستنتج
  // boolean تلقائيًا من القيمة الابتدائية `false` (type inference)،
  // لكن كتابتها صريحة بتوضح نية الكود لأي قارئ.
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // ملاحظة: مفيش حاجة عرّفناها للـ `className={({ isActive }) => ...}`
  // بتاع <NavLink> لأن مكتبة react-router-dom نفسها عندها تعريفات TS
  // جاهزة لـ NavLinkProps - فـ `isActive` بقى معروف نوعه (boolean)
  // تلقائيًا من غير أي عمل إضافي منا.

  return (
    <>
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

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-icon ${menuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `mobile-link${isActive ? ' active' : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <button onClick={() => { logout(); setMenuOpen(false); }} className="mobile-logout">
            Logout
          </button>
        </div>
      )}
    </>
  );
}
