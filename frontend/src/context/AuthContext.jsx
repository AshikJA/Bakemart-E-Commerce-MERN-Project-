import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/wallet');
      setWalletBalance(res.data.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const refreshWallet = () => {
    fetchWalletBalance();
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userData.role || 'user');
    setUser(userData);
    fetchWalletBalance();
    window.dispatchEvent(new Event('authChange'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    setWalletBalance(0);
    window.dispatchEvent(new Event('authChange'));
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // You might have a /auth/me or similar endpoint. 
          // For now, we'll just set a basic user object from token/role.
          setUser({ role: localStorage.getItem('role') });
          await fetchWalletBalance();
        } catch (error) {
          console.error('Auth initialization failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      walletBalance, 
      loading, 
      login, 
      logout, 
      refreshWallet 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
