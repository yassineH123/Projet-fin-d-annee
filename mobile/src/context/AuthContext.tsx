import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'superadmin';
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  setUser: (user: AuthUser | null) => void;
  saveSession: (token: string, user: AuthUser) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['token', 'user']).then(([t, u]) => {
      if (t[1]) setToken(t[1]);
      if (u[1]) setUser(JSON.parse(u[1]));
    }).finally(() => setLoading(false));
  }, []);

  const saveSession = async (tok: string, userData: AuthUser) => {
    await AsyncStorage.multiSet([['token', tok], ['user', JSON.stringify(userData)]]);
    setToken(tok);
    setUser(userData);
  };

  const handleSetUser = async (userData: AuthUser | null) => {
    if (userData === null) {
      await AsyncStorage.multiRemove(['token', 'user']);
      setToken(null);
    }
    setUser(userData);
  };

  const value = useMemo(
    () => ({ user, token, setUser: handleSetUser, saveSession, loading }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
