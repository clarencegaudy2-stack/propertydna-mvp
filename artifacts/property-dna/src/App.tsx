import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import DashboardPage from "@/pages/dashboard";
import NewDealPage from "@/pages/deal-form";
import DealResultsPage from "@/pages/deal-results";
import AdminPage from "@/pages/admin";
import SettingsPage from "@/pages/settings";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "bottom" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#2563eb",
    colorForeground: "#0f172a",
    colorMutedForeground: "#64748b",
    colorDanger: "#dc2626",
    colorBackground: "#ffffff",
    colorInput: "#f8fafc",
    colorInputForeground: "#0f172a",
    colorNeutral: "#e2e8f0",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-slate-200",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-slate-900 font-bold",
    headerSubtitle: "text-slate-500",
    socialButtonsBlockButtonText: "text-slate-700 font-medium",
    formFieldLabel: "text-slate-700 font-medium",
    footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
    footerActionText: "text-slate-500",
    dividerText: "text-slate-400",
    identityPreviewEditButton: "text-blue-600",
    formFieldSuccessText: "text-emerald-600",
    alertText: "text-slate-700",
    logoBox: "flex justify-center",
    logoImage: "h-8 w-auto",
    socialButtonsBlockButton: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
    formFieldInput: "border border-slate-200 bg-slate-50 text-slate-900 rounded-md",
    footerAction: "bg-slate-50 border-t border-slate-100",
    dividerLine: "bg-slate-200",
    alert: "border border-red-200 bg-red-50 rounded-lg",
    otpCodeFieldInput: "border border-slate-200 bg-slate-50",
    formFieldRow: "gap-3",
    main: "px-8 py-6",
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function SignInPage() {
  return (
    <div className="min-h-screen bg-sidebar flex">
      <div className="hidden lg:flex flex-col justify-between w-[420px] p-10 bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <img src={`${basePath}/logo.svg`} alt="PropertyDNA" className="w-4 h-4 brightness-0 invert" />
          </div>
          <span className="font-bold text-sidebar-foreground tracking-tight">PropertyDNA</span>
        </div>
        <div>
          <blockquote className="text-sidebar-foreground/80 text-base leading-relaxed mb-4">
            "PropertyDNA gives me every number I need to make a decision in minutes instead of hours. It's become my first stop on every deal."
          </blockquote>
          <div className="text-sidebar-foreground/50 text-sm">— Real Estate Investor, Austin TX</div>
        </div>
        <div className="text-sidebar-foreground/40 text-xs">Powered by real financial math</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen bg-sidebar flex">
      <div className="hidden lg:flex flex-col justify-between w-[420px] p-10 bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <img src={`${basePath}/logo.svg`} alt="PropertyDNA" className="w-4 h-4 brightness-0 invert" />
          </div>
          <span className="font-bold text-sidebar-foreground tracking-tight">PropertyDNA</span>
        </div>
        <div>
          <blockquote className="text-sidebar-foreground/80 text-base leading-relaxed mb-4">
            "Stop guessing on deals. PropertyDNA gives you institutional-grade analysis in seconds."
          </blockquote>
          <div className="text-sidebar-foreground/50 text-sm">— Real Estate Investor, Denver CO</div>
        </div>
        <div className="text-sidebar-foreground/40 text-xs">Powered by real financial math</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your PropertyDNA account",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Analyze deals smarter. Start free.",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/login">
              <Redirect to="/sign-in" />
            </Route>
            <Route path="/signup">
              <Redirect to="/sign-up" />
            </Route>
            <Route path="/dashboard">
              <ProtectedRoute component={DashboardPage} />
            </Route>
            <Route path="/deals/new">
              <ProtectedRoute component={NewDealPage} />
            </Route>
            <Route path="/deals/:id">
              <ProtectedRoute component={DealResultsPage} />
            </Route>
            <Route path="/admin">
              <ProtectedRoute component={AdminPage} />
            </Route>
            <Route path="/settings">
              <ProtectedRoute component={SettingsPage} />
            </Route>
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
