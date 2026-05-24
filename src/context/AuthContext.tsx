"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  login: (userData: UserData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  /* Restore session on refresh */
  useEffect(() => {
    const storedUser = localStorage.getItem("itraana_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  /* Login */
  const login = (userData: UserData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("itraana_user", JSON.stringify(userData));
    setIsAuthOpen(false);
  };

  /* Logout */
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("itraana_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthOpen,
        setIsAuthOpen,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
