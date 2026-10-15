/**
 * Auth Context — global authentication state for the React app.
 * Provides user data, login/logout helpers, and loading state.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, signIn, signOut, registerStudent, isAuthenticated } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore the session from stored JWT
  useEffect(() => {
    async function restoreSession() {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (identifier, password) => {
    const result = await signIn(identifier, password);
    setUser(result.data);
    return result;
  }, []);

  const register = useCallback(async (formData) => {
    const result = await registerStudent(formData);
    // Don't auto-set user here — let them go to login
    return result;
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
