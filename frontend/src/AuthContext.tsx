import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "./api";
import {
  clearStoredAuth,
  loadStoredAuth,
  saveStoredAuth,
} from "./sessionCache";
import { AuthUser } from "./types";

export type { AuthUser };

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const applyAuth = (nextUser: AuthUser, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    api.setAuthToken(nextToken);
    saveStoredAuth(nextToken, JSON.stringify(nextUser));
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    api.setAuthToken(null);
    clearStoredAuth();
  };

  useEffect(() => {
    const restoreSession = async () => {
      const { token: storedToken, userJson } = loadStoredAuth();

      if (!storedToken || !userJson) {
        setIsInitializing(false);
        return;
      }

      try {
        api.setAuthToken(storedToken);
        const { user: currentUser } = await api.getMe();
        setUser(currentUser);
        setToken(storedToken);
        saveStoredAuth(storedToken, JSON.stringify(currentUser));
      } catch {
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);
    applyAuth(result.user, result.token);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    const result = await api.register(username, email, password);
    applyAuth(result.user, result.token);
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isInitializing,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
