"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  mobile: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage on mount
    const mobile = localStorage.getItem("krishi_user_mobile");
    const name = localStorage.getItem("krishi_user_name");

    if (mobile && name) {
      setUser({ name, mobile });
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    localStorage.setItem("krishi_user_mobile", userData.mobile);
    localStorage.setItem("krishi_user_name", userData.name);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
    }
    localStorage.removeItem("krishi_user_mobile");
    localStorage.removeItem("krishi_user_name");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
