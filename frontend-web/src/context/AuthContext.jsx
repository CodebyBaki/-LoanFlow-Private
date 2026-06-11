import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth';

const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    role: String(user.role || '').trim().toLowerCase(),
  };
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch {
        localStorage.removeItem('user');
      }
    }

    if (token) {
      getMe()
        .then((res) => {
          const normalized = normalizeUser(res.data.customer);
          setUser(normalized);
          localStorage.setItem('user', JSON.stringify(normalized));
        })
        .catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userData) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (role) => user?.role === String(role || '').trim().toLowerCase();

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout, hasRole, isAdmin: hasRole('admin') }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
