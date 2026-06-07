import { createContext, useContext, useState, ReactNode } from "react";

// FUTURE: Replace with real auth (Clerk, Replit Auth, etc.)
// This is a mock auth context for Phase 1 MVP.
// Sessions persist via localStorage so refreshing the browser doesn't log the user out.

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

const STORAGE_KEY = "pdna_session_v1";

const MOCK_USERS: User[] = [
  { id: 1, name: "Alex Johnson", email: "alex@example.com", role: "user" },
  { id: 2, name: "Admin User", email: "admin@propertydna.com", role: "admin" },
];

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveSession(user: User): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(user)); } catch { /* ignore */ }
}

function clearSession(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage so session survives page refresh / browser close-reopen
  const [user, setUser] = useState<User | null>(() => loadSession());

  function login(email: string, _password: string): boolean {
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      saveSession(found);
      return true;
    }
    return false;
  }

  function signup(name: string, email: string, _password: string): boolean {
    const newUser: User = { id: Date.now(), name, email, role: "user" };
    setUser(newUser);
    saveSession(newUser);
    return true;
  }

  function logout() {
    setUser(null);
    clearSession();
  }

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
