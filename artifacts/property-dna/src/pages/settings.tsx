import { useAuth } from "@/lib/auth";
import Layout from "@/components/layout";
import { Settings, FileSpreadsheet, Bot, CreditCard, User, Bell, ExternalLink } from "lucide-react";

function PlaceholderSection({
  icon: Icon,
  title,
  description,
  fields,
  buttonLabel,
}: {
  icon: typeof Settings;
  title: string;
  description: string;
  fields: { label: string; placeholder: string; type?: string }[];
  buttonLabel: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">
          Phase 2
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{description}</p>
      <div className="space-y-3">
        {fields.map(({ label, placeholder, type }) => (
          <div key={label}>
            <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
            <input
              type={type ?? "text"}
              placeholder={placeholder}
              disabled
              className="w-full px-3 py-2 rounded-md border border-input bg-muted/40 text-sm text-muted-foreground/60 cursor-not-allowed"
            />
          </div>
        ))}
      </div>
      <button disabled className="mt-4 text-xs font-semibold text-muted-foreground/50 px-4 py-2 border border-border rounded-md cursor-not-allowed bg-muted/30 w-full sm:w-auto">
        {buttonLabel} (Coming Soon)
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!user) return null;

  return (
    <Layout title="Settings">
      <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-7 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account and configure Phase 2 integrations.</p>
        </div>

        {/* Profile */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Profile</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-widest">
              Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Full Name</label>
              <input
                type="text"
                value={user.name}
                readOnly
                className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/40 text-sm text-foreground cursor-default"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Email Address</label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/40 text-sm text-foreground cursor-default"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Account managed by Clerk. To update your name, email, or password, use the Clerk account portal.
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Account type:</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
              user.isAdmin
                ? "bg-violet-50 text-violet-700 border-violet-200"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}>
              {user.isAdmin ? "Admin" : "Standard User"}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-blue-50 text-blue-600 border-blue-200">
              {user.subscriptionStatus}
            </span>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Notifications</span>
          </div>
          <div className="space-y-3">
            {["Email me when my report is ready", "Weekly deal pipeline summary"].map((label) => (
              <label key={label} className="flex items-center gap-3 cursor-not-allowed opacity-50">
                <input type="checkbox" disabled className="rounded" />
                <span className="text-sm text-muted-foreground">{label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/60 mt-3">Email notifications available in Phase 2.</p>
        </div>

        <div className="space-y-4">
          <PlaceholderSection
            icon={FileSpreadsheet}
            title="Google Sheets Export"
            description="Automatically sync every submitted deal to a Google Sheets spreadsheet."
            fields={[
              { label: "Google Sheets Spreadsheet URL", placeholder: "https://docs.google.com/spreadsheets/d/..." },
              { label: "Sheet Name / Tab", placeholder: "Deals" },
            ]}
            buttonLabel="Connect Google Sheets"
          />

          <PlaceholderSection
            icon={Bot}
            title="OpenAI — AI Deal Coach"
            description="Connect your OpenAI API key to enable GPT-4 powered deal analysis on every results page."
            fields={[
              { label: "OpenAI API Key", placeholder: "sk-...", type: "password" },
              { label: "Model", placeholder: "gpt-4o" },
            ]}
            buttonLabel="Save OpenAI Key"
          />

          <PlaceholderSection
            icon={CreditCard}
            title="Stripe Billing"
            description="Connect Stripe to enable one-time payments for full professional deal reports ($49 per report)."
            fields={[
              { label: "Stripe Publishable Key", placeholder: "pk_live_..." },
              { label: "Stripe Secret Key", placeholder: "sk_live_...", type: "password" },
              { label: "Full Report Price (USD)", placeholder: "49" },
            ]}
            buttonLabel="Connect Stripe"
          />
        </div>
      </div>
    </Layout>
  );
}
