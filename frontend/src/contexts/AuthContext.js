import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getAdminUser } from '../firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for admin user first
    const adminUser = getAdminUser();
    if (adminUser) {
      setUser(adminUser);
      setLoading(false);
      return;
    }

    // Then check Firebase auth
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [setUser]);

  const value = {
    user,
    loading,
    error,
    setError,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};