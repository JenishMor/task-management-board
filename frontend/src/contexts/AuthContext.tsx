import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { getProfile } from "../utils/api";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, setting loading to false");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Token found, fetching user profile");
        const userData = await getProfile();
        console.log("User profile fetched successfully:", userData);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
