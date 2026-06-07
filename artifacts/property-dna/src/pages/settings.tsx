import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import Layout from "@/components/layout";
import { Settings, FileSpreadsheet, Bot, CreditCard, User, Bell } from "lucide-react";

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
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">
          Phase 2
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
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
      <button disabled className="mt-4 text-xs font-semibold text-muted-foreground/50 px-4 py-2 border border-border rounded-md cursor-not-allowed bg-muted/30">
        {buttonLabel} (Coming Soon)
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (!user) { navigate("/login"); return null; }

  return (
    <Layout title="Settings">
      <div className="px-8 py-7 max-w-3xl mx-auto">
        <div className="mb-7">
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account and configure integrations for Phase 2.</p>
        </div>

        {/* Profile */}
        <div className="bg-card border border-border rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Profile</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Full Name</label>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Email Address</label>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground italic">
            Profile editing is a mock in Phase 1. Real persistence is enabled in Phase 2 with full auth.
          </div>
        </div>

        {/* Notification placeholder */}
        <div className="bg-card border border-border rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
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
          {/* FUTURE: Google Sheets integration — POST deal data to a configured Google Sheets spreadsheet via Sheets API v4 */}
          <PlaceholderSection
            icon={FileSpreadsheet}
            title="Google Sheets Export"
            description="Automatically sync every submitted deal to a Google Sheets spreadsheet. Great for teams that prefer manual deal tracking alongside PropertyDNA."
            fields={[
              { label: "Google Sheets Spreadsheet URL", placeholder: "https://docs.google.com/spreadsheets/d/..." },
              { label: "Sheet Name / Tab", placeholder: "Deals" },
            ]}
            buttonLabel="Connect Google Sheets"
          />

          {/* FUTURE: OpenAI integration — store API key to power AI Deal Coach on deal results pages */}
          <PlaceholderSection
            icon={Bot}
            title="OpenAI — AI Deal Coach"
            description="Connect your OpenAI API key to enable GPT-4 powered deal analysis on every results page. The AI coach will flag risks, suggest negotiation tactics, and summarize each deal in plain English."
            fields={[
              { label: "OpenAI API Key", placeholder: "sk-...", type: "password" },
              { label: "Model", placeholder: "gpt-4o" },
            ]}
            buttonLabel="Save OpenAI Key"
          />

          {/* FUTURE: Stripe integration — connect Stripe account to accept payments for full report unlocks */}
          <PlaceholderSection
            icon={CreditCard}
            title="Stripe Billing"
            description="Connect Stripe to enable one-time payments for full professional deal reports ($49 per report). Users can upgrade directly from any deal results page."
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
