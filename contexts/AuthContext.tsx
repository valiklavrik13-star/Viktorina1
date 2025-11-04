import React, { createContext, useContext, useMemo, PropsWithChildren } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
// FIX: Import User type from the central types file.
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useLocalStorage<User | null>('authUser', null);

  const login = () => {
    // Для симуляции мы создадим стабильного пользователя.
    // В реальном приложении здесь была бы логика с Telegram API.
    setUser({ id: 'mock-user-telegram-12345' });
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
