import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister, getProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('denly_token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('denly_role') || 'guest');
  const [loading, setLoading] = useState(true);

  // Initialize session from token
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await getProfile();
          setUser(profile);
          setRole(profile.role || 'adopter');
          localStorage.setItem('denly_role', profile.role || 'adopter');
        } catch (err) {
          console.warn('Session expired or invalid profile:', err.message);
          // If profile fetch fails, keep token or clear if 401
          const savedUser = localStorage.getItem('denly_user');
          if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser);
              setUser(parsed);
              setRole(parsed.role || 'adopter');
            } catch (e) {
              logout();
            }
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    const accessToken = data.session?.access_token || 'demo-token';
    const profile = data.user ? {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name || email.split('@')[0],
      role: data.user.user_metadata?.role || 'adopter'
    } : { email, role: 'adopter', full_name: email.split('@')[0] };

    setToken(accessToken);
    setUser(profile);
    setRole(profile.role);
    localStorage.setItem('denly_token', accessToken);
    localStorage.setItem('denly_role', profile.role);
    localStorage.setItem('denly_user', JSON.stringify(profile));
    return profile;
  };

  const register = async (name, email, password, requestedRole = 'adopter') => {
    const data = await apiRegister(name, email, password, requestedRole);
    const accessToken = data.session?.access_token || 'demo-token';
    const profile = data.user ? {
      id: data.user.id,
      email: data.user.email,
      full_name: name,
      role: requestedRole
    } : { email, role: requestedRole, full_name: name };

    setToken(accessToken);
    setUser(profile);
    setRole(requestedRole);
    localStorage.setItem('denly_token', accessToken);
    localStorage.setItem('denly_role', requestedRole);
    localStorage.setItem('denly_user', JSON.stringify(profile));
    return profile;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole('guest');
    localStorage.removeItem('denly_token');
    localStorage.removeItem('denly_role');
    localStorage.removeItem('denly_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
