import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = async (email: string, pass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            if (users[email]) {
                reject(new Error('User with this email already exists.'));
                return;
            }
            users[email] = { pass }; // In a real app, hash the password
            localStorage.setItem('users', JSON.stringify(users));

            const newUser = { email };
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            setCurrentUser(newUser);
            resolve();
        }, 500);
    });
  };

  const login = async (email: string, pass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            if (!users[email] || users[email].pass !== pass) {
                reject(new Error('Invalid email or password.'));
                return;
            }
            const user = { email };
            localStorage.setItem('currentUser', JSON.stringify(user));
            setCurrentUser(user);
            resolve();
        }, 500);
    });
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
