import React, { createContext, useState, useContext, useEffect } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
} from "firebase/auth";
import { auth } from "../configs/firebase";
interface AuthContextsType {
  user: User | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContexts = createContext<AuthContextsType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContexts);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    login,
    register,
    logout,
  };

  return (
    <AuthContexts.Provider value={value}> {children}</AuthContexts.Provider>
  );
};
