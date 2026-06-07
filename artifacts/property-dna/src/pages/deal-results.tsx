import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import Layout from "@/components/layout";
import {
  useGetDeal,
  useGetDealResults,
  getGetDealQueryKey,
  getGetDealResultsQueryKey,
} from "@workspace/api-client-react";
import { formatCurrency, formatPercent, formatNumber, cn } from "@/lib/utils";
import {
  ratingLabel,
  RATING_BADGE_CLASS,
  RATING_VERDICT_CLASS,
  RATING_TEXT_CLASS,
  RATING_SUBTEXT_CLASS,
} from "@/lib/ratings";
import {
  MapPin,
  Bot,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  BarChart2,
  Home,
  Navigation,
  TrendingUp,
  ShieldAlert,
  Lightbulb,
  StickyNote,
  Sparkles,
  Lock,
} from "lucide-react";

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    NEW: { label: "New", cls: "bg-slate-100 text-slate-600" },
    PAID: { label: "Paid", cls: "bg-blue-50 text-blue-600" },
    IN_PROGRESS: { label: "In Progress", cls: "bg-amber-50 text-amber-600" },
    COMPLETED: { label: "Completed", cls: "bg-emerald-50 text-emerald-700" },
  };
  const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap", s.cls)}>
      {s.label}
    </span>
  );
}

// ── Score Gauge ────────────────────────────────────────────────────────────────

function ScoreGauge({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? "#10b981" : pct >= 45 ? "#f59e0b" : "#ef4444";
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  const dim = size === "sm" ? "w-20 h-20" : "w-28 h-28 sm:w-32 sm:h-32";
  const textSize = size === "sm" ? "text-xl" : "text-2xl sm:text-3xl";

  return (
    <div className={cn("relative shrink-0", dim)}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-black text-foreground", textSize)}>{score.toFixed(0)}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

// ── Metric Card ────────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, positive }: {
  label: string; value: string; sub?: string; positive?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3.5">
      <div className="text-xs text-muted-foreground mb-1 leading-tight">{label}</div>
      <div className={cn("text-base sm:text-lg font-bold leading-tight",
        positive === true ? "text-emerald-600" :
        positive === false ? "text-red-600" : "text-foreground"
      )}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Placeholder Section ────────────────────────────────────────────────────────

function PlaceholderField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {value ? (
        <span className="text-sm font-medium text-foreground">{value}</span>
      ) : (
        <span className="text-xs text-muted-foreground/50 italic">Not entered</span>
      )}
    </div>
  );
}

function PlaceholderTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-muted/60 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
      <Lock className="w-3 h-3 shrink-0" />
      {children}
      <span className="ml-1 text-[9px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-1.5 py-0.5 rounded">P2</span>
    </div>
  );
}

function PlaceholderSection({ title, icon: Icon, items }: {
  title: string;
  icon: typeof MapPin;
  items: string[];
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded border border-border">Phase 2</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <PlaceholderTag key={item}>{item}</PlaceholderTag>
        ))}
      </div>
    </div>
  );
}

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS = [
  { key: "investment", label: "Investment", icon: BarChart2 },
  { key: "property",   label: "Property",   icon: Home },
  { key: "location",   label: "Location",   icon: Navigation },
  { key: "market",     label: "Market",     icon: TrendingUp },
  { key: "risk",       label: "Risk",       icon: ShieldAlert },
  { key: "strategy",   label: "Strategy",   icon: Lightbulb },
  { key: "notes",      label: "Notes",      icon: StickyNote },
  { key: "ai-coach",   label: "AI Coach",   icon: Sparkles },
] as const;

type TabKey = typeof TABS[number]["key"];

// ── Main Component ────────────────────────────────────────────────────────────

export default function DealResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("investment");
  const dealId = Number(id);

  const { data: deal, isLoading: dealLoading } = useGetDeal(dealId, {
    query: { enabled: !!dealId, queryKey: getGetDealQueryKey(dealId) },
  });
  const { data: results, isLoading: resultsLoading } = useGetDealResults(dealId, {
    query: { enabled: !!dealId, queryKey: getGetDealResultsQueryKey(dealId) },
  });

  if (!user) { navigate("/login"); return null; }

  if (dealLoading || resultsLoading) {
    return (
      <Layout title="Deal Report">
        <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
          Loading deal report...
        </div>
      </Layout>
    );
  }

  if (!deal || !results) {
    return (
      <Layout title="Deal Not Found">
        <div className="flex flex-col items-center justify-center h-64 gap-3 px-4">
          <XCircle className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Deal not found.</p>
          <Link href="/dashboard" className="text-sm text-primary hover:underline">Back to dashboard</Link>
        </div>
      </Layout>
    );
  }

  const rating = deal.dealRating ?? "Red";
  const cashFlowPositive = results.monthlyCashFlow >= 0;
  const label = ratingLabel(rating);

  // ── Tab content ──────────────────────────────────────────────────────────────

  function renderInvestment() {
    return (
      <div className="space-y-4">
        {/* Verdict hero */}
        <div className={cn("rounded-2xl border p-4 sm:p-5", RATING_VERDICT_CLASS[rating] ?? "bg-muted/30 border-border")}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ScoreGauge score={results!.dealScore} />
            <div className="flex-1 text-center sm:text-left">
              <div className={cn("text-xs font-semibold uppercase tracking-widest mb-1", RATING_SUBTEXT_CLASS[rating])}>
                Deal Rating
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <span className={cn("text-2xl sm:text-3xl font-black", RATING_TEXT_CLASS[rating])}>
                  {label}
                </span>
                {rating === "Green" && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                {rating === "Yellow" && <AlertTriangle className="w-6 h-6 text-amber-500" />}
                {rating === "Red" && <XCircle className="w-6 h-6 text-red-500" />}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-sm text-muted-foreground">Recommendation:</span>
                <span className={cn(
                  "text-sm font-bold px-3 py-1 rounded-full",
                  results!.recommendation === "Buy" ? "bg-emerald-100 text-emerald-700" :
                  results!.recommendation === "Review" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                )}>
                  {results!.recommendation}
                </span>
              </div>
            </div>
            <div className="text-center border-t sm:border-t-0 sm:border-l border-current/10 pt-3 sm:pt-0 sm:pl-5 w-full sm:w-auto">
              <div className="text-xs text-muted-foreground mb-0.5">Monthly Cash Flow</div>
              <div className={cn("text-2xl sm:text-3xl font-black", cashFlowPositive ? "text-emerald-700" : "text-red-700")}>
                {cashFlowPositive ? "+" : ""}{formatCurrency(results!.monthlyCashFlow)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">per month</div>
            </div>
          </div>
        </div>

        {/* Key metrics — 2-col mobile, 4-col desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Monthly Cash Flow" value={formatCurrency(results!.monthlyCashFlow)} positive={cashFlowPositive} />
          <MetricCard label="Annual Cash Flow" value={formatCurrency(results!.annualCashFlow)} positive={results!.annualCashFlow >= 0} />
          <MetricCard label="Cash-on-Cash" value={formatPercent(results!.cashOnCashReturn)} positive={results!.cashOnCashReturn >= 7} />
          <MetricCard label="DSCR" value={formatNumber(results!.dscr)} sub="≥1.25 is strong" positive={results!.dscr >= 1.25} />
          <MetricCard label="Cap Rate" value={formatPercent(results!.capRate)} positive={results!.capRate >= 6} />
          <MetricCard label="NOI (annual)" value={formatCurrency(results!.noi ?? 0)} />
          <MetricCard label="Monthly Mortgage" value={formatCurrency(results!.monthlyMortgage ?? 0)} />
          <MetricCard label="Total Expenses/mo" value={formatCurrency(results!.totalMonthlyExpenses ?? 0)} />
        </div>

        {/* Investment Summary */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Investment Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
            {[
              { label: "Purchase Price", value: formatCurrency(deal!.purchasePrice) },
              { label: "Down Payment", value: formatCurrency(deal!.downPayment) },
              { label: "Loan Amount", value: formatCurrency(deal!.purchasePrice - deal!.downPayment) },
              { label: "Rehab Budget", value: formatCurrency(deal!.rehabBudget ?? 0) },
              { label: "Closing Costs", value: formatCurrency(deal!.closingCosts ?? 0) },
              { label: "Total Cash In", value: formatCurrency(results!.totalInvestment ?? 0) },
              { label: "Interest Rate", value: formatPercent(deal!.interestRate) },
              { label: "Loan Term", value: `${deal!.loanTerm} years` },
              { label: "Monthly Rent", value: formatCurrency(deal!.estimatedRent) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderProperty() {
    return (
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Property Details</h3>
          <p className="text-xs text-muted-foreground mb-4">Enter in the deal form to populate. Phase 2 adds automatic parcel data lookup.</p>
          <PlaceholderField label="Address" value={deal!.address} />
          <PlaceholderField label="Property Type" />
          <PlaceholderField label="Bedrooms" />
          <PlaceholderField label="Bathrooms" />
          <PlaceholderField label="Square Footage" />
          <PlaceholderField label="Lot Size" />
          <PlaceholderField label="Year Built" />
          <PlaceholderField label="Parcel / APN" />
          <PlaceholderField label="Zoning" />
        </div>

        {/* Photos placeholder */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Property Photos</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded border border-border">Phase 2</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="aspect-square rounded-lg bg-muted/50 border border-dashed border-border flex items-center justify-center">
                <Home className="w-5 h-5 text-muted-foreground/30" />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/60 mt-3 italic">
            Photo upload and Google Street View integration available in Phase 2.
          </p>
        </div>
      </div>
    );
  }

  function renderLocation() {
    return (
      <div className="space-y-4">
        {/* Map placeholder */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="h-40 sm:h-52 bg-muted/40 flex flex-col items-center justify-center gap-2 border-b border-border">
            <Navigation className="w-8 h-8 text-muted-foreground/30" />
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">{deal!.address}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Interactive map available in Phase 2 (Google Maps API)</p>
            </div>
          </div>
          <div className="px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded border border-border">Phase 2</span>
          </div>
        </div>

        <PlaceholderSection
          title="Neighborhood Snapshot"
          icon={MapPin}
          items={["Walk Score", "Bike Score", "Transit Score", "Neighborhood Grade", "Population Density"]}
        />
        <PlaceholderSection
          title="Nearby Amenities"
          icon={Navigation}
          items={["Schools (K–12)", "Grocery Stores", "Restaurants", "Hospitals", "Parks", "Entertainment", "Gym / Fitness"]}
        />
        <PlaceholderSection
          title="Risk Factors"
          icon={ShieldAlert}
          items={["Flood Zone", "Wildfire Risk", "Earthquake Risk", "Crime Index", "Air Quality"]}
        />
      </div>
    );
  }

  function renderMarket() {
    return (
      <div className="space-y-4">
        <div className="bg-accent/40 border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground flex items-start gap-2">
          <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
          <span>Market data pulls from MLS comps, Zillow, and Rentometer in Phase 2. The fields below will auto-populate once the property address is verified.</span>
        </div>

        <PlaceholderSection
          title="Comparable Sales"
          icon={BarChart2}
          items={["Nearest 3 Sold Comps", "Price per Sq Ft", "Days on Market", "List-to-Sale Ratio", "Median Sale Price (90 days)"]}
        />
        <PlaceholderSection
          title="Comparable Rentals"
          icon={TrendingUp}
          items={["Nearest 3 Rental Comps", "Rent per Sq Ft", "Average Days to Lease", "Vacancy Rate", "Median Market Rent"]}
        />
        <PlaceholderSection
          title="Market Trend"
          icon={TrendingUp}
          items={["12-Month Price Appreciation", "Inventory Levels", "Absorption Rate", "Seller vs Buyer Market", "Population Growth"]}
        />
      </div>
    );
  }

  function renderRisk() {
    const dscrRisk = results!.dscr < 1 ? "High" : results!.dscr < 1.25 ? "Moderate" : "Low";
    const dscrRiskColor = dscrRisk === "High" ? "text-red-600" : dscrRisk === "Moderate" ? "text-amber-600" : "text-emerald-600";
    const cfRisk = !cashFlowPositive ? "High" : results!.monthlyCashFlow < 200 ? "Moderate" : "Low";
    const cfRiskColor = cfRisk === "High" ? "text-red-600" : cfRisk === "Moderate" ? "text-amber-600" : "text-emerald-600";

    return (
      <div className="space-y-4">
        {/* Calculated risks */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Calculated Risk Factors</h3>
          <div className="space-y-0">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Debt Service Coverage (DSCR)</p>
                <p className="text-xs text-muted-foreground">DSCR of {formatNumber(results!.dscr)} — {results!.dscr < 1 ? "income doesn't cover debt" : results!.dscr < 1.25 ? "below lender threshold" : "strong coverage"}</p>
              </div>
              <span className={cn("text-sm font-bold", dscrRiskColor)}>{dscrRisk} Risk</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Cash Flow Risk</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(results!.monthlyCashFlow)}/mo — {!cashFlowPositive ? "negative cash flow" : results!.monthlyCashFlow < 200 ? "thin margin" : "healthy buffer"}</p>
              </div>
              <span className={cn("text-sm font-bold", cfRiskColor)}>{cfRisk} Risk</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Cap Rate</p>
                <p className="text-xs text-muted-foreground">{formatPercent(results!.capRate)} — {results!.capRate < 4 ? "below market threshold" : results!.capRate < 6 ? "market rate" : "above market"}</p>
              </div>
              <span className={cn("text-sm font-bold", results!.capRate < 4 ? "text-red-600" : results!.capRate < 6 ? "text-amber-600" : "text-emerald-600")}>
                {results!.capRate < 4 ? "High" : results!.capRate < 6 ? "Moderate" : "Low"} Risk
              </span>
            </div>
          </div>
        </div>

        {/* Phase 2 risk factors */}
        <PlaceholderSection
          title="Extended Risk Analysis"
          icon={ShieldAlert}
          items={["Flood Risk Score", "Insurance Cost Estimate", "Vacancy Risk", "Expense Creep Risk", "Market Downside Risk", "DSCR Stress Test (+2% rate)"]}
        />
      </div>
    );
  }

  function renderStrategy() {
    const strategies = [
      { name: "Conventional Mortgage", match: results!.dscr >= 1.25 && deal!.downPayment / deal!.purchasePrice >= 0.2, note: "20%+ down, strong DSCR" },
      { name: "DSCR Loan", match: results!.dscr >= 1.0, note: "Income-based, no income docs" },
      { name: "FHA Loan", match: deal!.downPayment / deal!.purchasePrice >= 0.035, note: "3.5%+ down, primary residence" },
      { name: "VA Loan", match: false, note: "Veterans only, 0% down" },
      { name: "Seller Financing", match: false, note: "Direct seller negotiation" },
      { name: "Subject-To", match: false, note: "Take over existing mortgage" },
      { name: "Lease Option", match: false, note: "Rent-to-own structure" },
      { name: "BRRRR", match: (deal!.rehabBudget ?? 0) > 0, note: "Buy, Rehab, Rent, Refi, Repeat" },
      { name: "Master Lease", match: false, note: "Lease entire property, sublease units" },
    ];

    return (
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground">Financing Strategy Options</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Preliminary match based on your submitted numbers. Full lender qualification analysis available in Phase 2.
          </p>
          <div className="space-y-0">
            {strategies.map(({ name, match, note }) => (
              <div key={name} className="flex items-center justify-between py-2.5 border-b border-border last:border-0 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-[11px] text-muted-foreground">{note}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap shrink-0",
                  match ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                )}>
                  {match ? "Possible Match" : "Verify"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <PlaceholderSection
          title="Phase 2 — Lender Matching"
          icon={Lightbulb}
          items={["Live rate quotes", "DTI calculator", "Pre-qual estimate", "Lender comparison", "Document checklist"]}
        />
      </div>
    );
  }

  function renderNotes() {
    return (
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Deal Notes</h3>
          {deal!.notes ? (
            <p className="text-sm text-foreground leading-relaxed">{deal!.notes}</p>
          ) : (
            <div className="text-center py-8">
              <StickyNote className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notes added for this deal.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add notes when submitting a new deal.</p>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Deal Timeline</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded border border-border">Phase 2</span>
          </div>
          <div className="space-y-3">
            {["Offer submitted", "Inspection scheduled", "Appraisal ordered", "Clear to close", "Funded"].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-border bg-muted/30 shrink-0" />
                <span className="text-sm text-muted-foreground/60 italic">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderAICoach() {
    const strengthCount = [cashFlowPositive, results!.dscr >= 1.25, results!.capRate >= 6, results!.cashOnCashReturn >= 7].filter(Boolean).length;
    return (
      <div className="space-y-4">
        {/* Phase 2 banner */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">AI Deal Coach</span>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">Phase 2</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            GPT-4o will analyze your complete deal and deliver an investor-grade intelligence brief. Connect your OpenAI key in Settings to unlock.
          </p>
        </div>

        {/* Preview sections with mock content */}
        {[
          {
            title: "Deal Strengths",
            icon: CheckCircle2,
            iconColor: "text-emerald-500",
            content: strengthCount > 0
              ? `${strengthCount} positive indicator${strengthCount > 1 ? "s" : ""} detected: ${[cashFlowPositive && "positive cash flow", results!.dscr >= 1.25 && "strong DSCR", results!.capRate >= 6 && "solid cap rate", results!.cashOnCashReturn >= 7 && "good CoC return"].filter(Boolean).join(", ")}.`
              : "Limited strengths at current purchase price. Consider renegotiating.",
          },
          {
            title: "Key Risks",
            icon: AlertTriangle,
            iconColor: "text-amber-500",
            content: `DSCR of ${formatNumber(results!.dscr)} ${results!.dscr < 1.25 ? "is below the typical lender threshold of 1.25. " : "is strong. "}Monthly cash flow of ${formatCurrency(results!.monthlyCashFlow)} ${!cashFlowPositive ? "is negative — proceed with caution." : "provides adequate buffer."}`,
          },
          {
            title: "Negotiation Suggestions",
            icon: Lightbulb,
            iconColor: "text-blue-500",
            content: "Full negotiation playbook unlocks in Phase 2 — includes price reduction targets, seller concession requests, and closing cost strategies based on market conditions.",
          },
          {
            title: "Lender Readiness",
            icon: BarChart2,
            iconColor: "text-purple-500",
            content: `Based on a ${formatPercent(deal!.downPayment / deal!.purchasePrice * 100)} down payment and DSCR of ${formatNumber(results!.dscr)}, a detailed lender-readiness score is available in Phase 2.`,
          },
          {
            title: "Next Best Action",
            icon: Sparkles,
            iconColor: "text-primary",
            content: rating === "Green"
              ? "Schedule an inspection and order an appraisal. This deal's fundamentals support moving forward."
              : rating === "Yellow"
              ? "Request seller concessions or a price reduction of 5–8% to improve cash flow before proceeding."
              : "Pass on this deal at current pricing. Set a maximum offer price alert for when it gets relisted.",
          },
        ].map(({ title, icon: Icon, iconColor, content }) => (
          <div key={title} className="bg-card border border-border rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", iconColor)} />
              <span className="text-sm font-semibold text-foreground">{title}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
          </div>
        ))}

        <button disabled className="w-full mt-1 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground/50 px-4 py-3 border border-dashed border-border rounded-xl cursor-not-allowed">
          <Sparkles className="w-4 h-4" />
          Connect OpenAI to Run Full AI Analysis (Phase 2)
        </button>
      </div>
    );
  }

  const tabContent: Record<TabKey, () => React.ReactNode> = {
    investment: renderInvestment,
    property: renderProperty,
    location: renderLocation,
    market: renderMarket,
    risk: renderRisk,
    strategy: renderStrategy,
    notes: renderNotes,
    "ai-coach": renderAICoach,
  };

  return (
    <Layout title="Deal Report">
      <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-7 max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight">{deal.address}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {formatCurrency(deal.purchasePrice)} · {deal.loanTerm}yr @ {deal.interestRate}% · {formatCurrency(deal.estimatedRent)}/mo rent
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "inline-flex items-center text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
              RATING_BADGE_CLASS[rating] ?? "bg-muted text-muted-foreground"
            )}>
              {label}
            </span>
            <StatusBadge status={deal.status} />
          </div>
        </div>

        {/* ── Tab Bar — horizontally scrollable on mobile ── */}
        <div className="relative mb-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-0.5 bg-muted/50 rounded-xl p-1 border border-border">
            {TABS.map(({ key, label: tabLabel, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                  activeTab === key
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {tabLabel}
                {key === "ai-coach" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-0.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div>
          {tabContent[activeTab]()}
        </div>

        {/* ── Full Report Upgrade — always visible below tabs ── */}
        <div className="mt-5 bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Full Investor Report — PDF</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded border border-border">Phase 2</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Professionally formatted PDF with executive summary, comparable analysis, full risk assessment, AI narrative, and lender-ready documentation.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button disabled className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground/50 px-4 py-2 border border-dashed border-border rounded-lg cursor-not-allowed bg-muted/30">
              <Lock className="w-3.5 h-3.5" />
              Unlock Full Report — $49 (Coming Soon)
            </button>
            <span className="text-xs text-muted-foreground">Powered by Stripe</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
