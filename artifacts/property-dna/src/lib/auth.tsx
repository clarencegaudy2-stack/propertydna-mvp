import { createContext, useContext, useState, ReactNode } from "react";

// FUTURE: Replace with real auth (Clerk, Replit Auth, etc.)
// This is a mock auth context for Phase 1 MVP.

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, _password: string) => boolean;
  signup: (name: string, email: string, _password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: User[] = [
  { id: 1, name: "Alex Johnson", email: "alex@example.com", role: "user" },
  { id: 2, name: "Admin User", email: "admin@propertydna.com", role: "admin" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  function login(email: string, _password: string): boolean {
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) { setUser(found); return true; }
    return false;
  }

  function signup(name: string, email: string, _password: string): boolean {
    const newUser: User = { id: Date.now(), name, email, role: "user" };
    setUser(newUser);
    return true;
  }

  function logout() { setUser(null); }

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
