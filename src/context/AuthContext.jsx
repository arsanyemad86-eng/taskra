import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('taskra_user');
    return saved ? JSON.parse(saved) : null;
  });

  function login(name, password) {
    const saved = localStorage.getItem('taskra_credentials');
    const creds = saved ? JSON.parse(saved) : null;

    if (!creds) {
      // أول مرة — سجل الـ credentials
      const newUser = { name };
      localStorage.setItem('taskra_credentials', JSON.stringify({ name, password }));
      localStorage.setItem('taskra_user', JSON.stringify(newUser));
      setUser(newUser);
      return true;
    }

    if (creds.name === name && creds.password === password) {
      localStorage.setItem('taskra_user', JSON.stringify({ name }));
      setUser({ name });
      return true;
    }

    return false;
  }

  function logout() {
    localStorage.removeItem('taskra_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}