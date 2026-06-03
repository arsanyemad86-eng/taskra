import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      setError('اكتب الاسم وكلمة السر.');
      return;
    }
    const ok = login(name.trim(), password);
    if (!ok) setError('الاسم أو كلمة السر غلط.');
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span>⚡</span> Taskra
        </div>
        <h2>Welcome back</h2>
        <p className="login-sub">Build. Focus. Compound.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn">Enter</button>
        </form>
      </div>
    </div>
  );
}