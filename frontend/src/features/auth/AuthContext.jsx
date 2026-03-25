import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('kuppi_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  function login(userData) {
    localStorage.setItem('kuppi_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('kuppi_user');
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
