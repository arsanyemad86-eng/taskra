import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // FormEvent<HTMLFormElement>: نوع جاهز من React لأي event بييجي من
  // <form onSubmit={...}>. الـ <HTMLFormElement> بيوضح إن e.currentTarget
  // (لو احتجناه) هيكون عنصر form بالتحديد.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
      <div className="login-card card">
        <div className="login-logo">
          <span aria-hidden="true">⚡</span>
        </div>
        <h2>Welcome back</h2>
        <p className="login-sub">Build. Focus. Compound.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-row">
            <label>Name</label>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-primary login-btn">Enter</button>
        </form>
      </div>
    </div>
  );
}
