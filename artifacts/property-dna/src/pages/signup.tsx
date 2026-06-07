import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Dna, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const perks = [
  "Deal score 0–100 with Buy / Review / Pass",
  "10+ financial metrics calculated instantly",
  "Deal report tracking dashboard",
  "Unlimited deal submissions",
];

export default function SignupPage() {
  const { signup } = useAuth();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    signup(name, email, password);
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-sidebar flex">
      {/* Left */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] p-10 bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Dna className="w-4 h-4 text-sidebar" />
          </div>
          <span className="font-bold text-sidebar-foreground tracking-tight">PropertyDNA</span>
        </div>
        <div>
          <p className="text-sidebar-foreground/60 text-xs uppercase tracking-widest mb-4">What you get</p>
          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-sm text-sidebar-foreground/80">
                <CheckCircle2 className="w-4 h-4 text-sidebar-primary shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sidebar-foreground/40 text-xs">Phase 1 MVP — No credit card required</div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
            <p className="text-sm text-muted-foreground">Start analyzing deals in under 2 minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="w-full px-3 py-2.5 rounded-md border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 rounded-md border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-md border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-md hover:bg-primary/90 transition-colors text-sm"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

          {/* FUTURE: Google OAuth, Apple Sign-In buttons go here */}
          {/* FUTURE: Stripe billing setup on account creation */}
        </div>
      </div>
    </div>
  );
}
