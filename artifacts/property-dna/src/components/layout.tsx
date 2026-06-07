import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  PlusCircle,
  Settings,
  ShieldCheck,
  LogOut,
  Dna,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deals/new", label: "New Analysis", icon: PlusCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children, title }: LayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Logo destination: dashboard if logged in, landing if not
  const logoHref = user ? "/dashboard" : "/";

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const LogoBlock = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <Link
      href={logoHref}
      className="flex items-center gap-2.5 group"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary shrink-0">
        <Dna className="w-4 h-4 text-sidebar" />
      </div>
      <div>
        <span className="text-sm font-bold text-sidebar-foreground tracking-tight">PropertyDNA</span>
        {!inDrawer && (
          <div className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">MVP</div>
        )}
      </div>
    </Link>
  );

  const NavLinks = () => (
    <>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = location === href || (href !== "/" && location.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        );
      })}

      {user?.role === "admin" && (
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors mt-2",
            location === "/admin"
              ? "bg-sidebar-accent text-sidebar-foreground font-medium"
              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          )}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          Admin Panel
        </Link>
      )}
    </>
  );

  const UserFooter = () =>
    user ? (
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-sidebar-primary">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
          <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.email}</p>
        </div>
        <button
          onClick={() => { logout(); }}
          className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors p-1"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    ) : null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 bg-sidebar border-r border-sidebar-border shrink-0 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <LogoBlock />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavLinks />
        </nav>
        <div className="px-3 py-4 border-t border-sidebar-border">
          <UserFooter />
        </div>
      </aside>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-sidebar z-50 flex flex-col transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
          <LogoBlock inDrawer />
          <button
            onClick={() => setMobileOpen(false)}
            className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="px-3 py-4 border-t border-sidebar-border">
          <UserFooter />
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 bg-card border-b border-border sticky top-0 z-30">
          {/* Hamburger */}
          <button
            className="lg:hidden text-foreground/70 hover:text-foreground transition-colors mr-1 p-1 shrink-0"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile logo — links to dashboard or landing */}
          <Link href={logoHref} className="flex items-center gap-2 lg:hidden">
            <Dna className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">PropertyDNA</span>
          </Link>

          {/* Breadcrumb — desktop */}
          {title && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs text-muted-foreground">PropertyDNA</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{title}</span>
            </div>
          )}

          {/* Page title centered on mobile */}
          {title && (
            <span className="lg:hidden text-sm font-semibold text-foreground ml-auto mr-auto">
              {title}
            </span>
          )}
        </header>

        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
