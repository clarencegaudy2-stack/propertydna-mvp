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
  recommendationLabel,
  RATING_BADGE_CLASS,
  RATING_VERDICT_CLASS,
  RATING_TEXT_CLASS,
  RATING_SUBTEXT_CLASS,
  RECOMMENDATION_COLOR,
} from "@/lib/ratings";
import {
  MapPin,
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
  Calculator,
  FileText,
  Building2,
  DollarSign,
} from "lucide-react";

// ── Shared helpers ────────────────────────────────────────────────────────────

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

function ScoreGauge({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-black text-foreground">{score.toFixed(0)}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

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

function Phase2Card({ title, icon: Icon, items }: {
  title: string; icon: typeof MapPin; items: string[];
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded border border-border shrink-0">Phase 2</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground/70">
            <Lock className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0 gap-3">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      {value ? (
        <span className="text-sm font-medium text-foreground text-right">{value}</span>
      ) : (
        <span className="text-xs text-muted-foreground/40 italic">—</span>
      )}
    </div>
  );
}

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS = [
  { key: "investment", label: "Investment",  icon: BarChart2 },
  { key: "property",   label: "Property",    icon: Home },
  { key: "location",   label: "Location",    icon: Navigation },
  { key: "market",     label: "Market",      icon: TrendingUp },
  { key: "risk",       label: "Risk",        icon: ShieldAlert },
  { key: "strategy",   label: "Strategy",    icon: Lightbulb },
  { key: "tax",        label: "Tax",         icon: Calculator },
  { key: "notes",      label: "Notes",       icon: StickyNote },
  { key: "ai-coach",   label: "AI Coach",    icon: Sparkles },
] as const;

type TabKey = typeof TABS[number]["key"];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DealResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoaded } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("investment");
  const dealId = Number(id);

  const { data: deal, isLoading: dealLoading } = useGetDeal(dealId, {
    query: { enabled: !!dealId, queryKey: getGetDealQueryKey(dealId) },
  });
  const { data: results, isLoading: resultsLoading } = useGetDealResults(dealId, {
    query: { enabled: !!dealId, queryKey: getGetDealResultsQueryKey(dealId) },
  });

  if (!isLoaded) return null;

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
          <Link href="/dashboard" className="text-sm text-primary hover:underline">← Back to dashboard</Link>
        </div>
      </Layout>
    );
  }

  const rating = deal.dealRating ?? "Red";
  const cashFlowPositive = results.monthlyCashFlow >= 0;
  const label = ratingLabel(rating);
  const recLabel = recommendationLabel(results.recommendation ?? "Do Not Proceed");
  const recColor = RECOMMENDATION_COLOR[results.recommendation ?? "Do Not Proceed"] ?? "bg-muted text-muted-foreground";

  // ── Tax calculations (rule-based, frontend) ───────────────────────────────
  const buildingValue = deal.purchasePrice * 0.80;
  const landValue = deal.purchasePrice * 0.20;
  const annualDepreciation = buildingValue / 27.5;
  const assumedTaxBracket = 0.28;
  const estimatedTaxSavings = annualDepreciation * assumedTaxBracket;
  const afterTaxAnnualCashFlow = results.annualCashFlow + estimatedTaxSavings;
  const taxAdjustedCoC = (results.totalInvestment ?? 0) > 0
    ? (afterTaxAnnualCashFlow / (results.totalInvestment ?? 1)) * 100
    : 0;

  // ── AI Coach rule-based analysis ─────────────────────────────────────────
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const riskFlags: string[] = [];

  if (cashFlowPositive) strengths.push(`Positive monthly cash flow of ${formatCurrency(results.monthlyCashFlow)}`);
  if (results.dscr >= 1.25) strengths.push(`Strong DSCR of ${formatNumber(results.dscr)} — above lender minimum`);
  if (results.capRate >= 7) strengths.push(`Cap rate of ${formatPercent(results.capRate)} is above market average`);
  if (results.cashOnCashReturn >= 10) strengths.push(`Cash-on-cash return of ${formatPercent(results.cashOnCashReturn)} exceeds 10% target`);
  if (results.dscr >= 1.5) strengths.push("Exceptional debt service coverage — strong lender profile");
  if (strengths.length === 0) strengths.push("No standout strengths at current purchase price");

  if (!cashFlowPositive) weaknesses.push(`Negative cash flow of ${formatCurrency(results.monthlyCashFlow)}/mo — deal loses money monthly`);
  if (results.dscr < 1.0) weaknesses.push(`DSCR below 1.0 — income does not cover debt service`);
  if (results.dscr >= 1.0 && results.dscr < 1.25) weaknesses.push(`DSCR of ${formatNumber(results.dscr)} is below the typical lender threshold of 1.25`);
  if (results.capRate < 4) weaknesses.push(`Cap rate of ${formatPercent(results.capRate)} is below market minimum`);
  if (results.cashOnCashReturn < 5) weaknesses.push(`Cash-on-cash return of ${formatPercent(results.cashOnCashReturn)} is below target`);
  if (weaknesses.length === 0) weaknesses.push("No major financial weaknesses identified");

  if (!cashFlowPositive) riskFlags.push("Negative cash flow creates dependency on appreciation");
  if (results.dscr < 1.25) riskFlags.push("DSCR below lender threshold may limit financing options");
  if (results.capRate < 5) riskFlags.push("Low cap rate increases sensitivity to vacancy and expense increases");
  if (deal.purchasePrice - deal.downPayment > deal.purchasePrice * 0.85) riskFlags.push("High LTV — limited equity buffer on entry");
  if (riskFlags.length === 0) riskFlags.push("No critical risk flags at current parameters");

  // ── Tab renderers ─────────────────────────────────────────────────────────

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
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2.5">
                <span className={cn("text-2xl sm:text-3xl font-black", RATING_TEXT_CLASS[rating])}>
                  {label}
                </span>
                {rating === "Green" && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                {rating === "Yellow" && <AlertTriangle className="w-6 h-6 text-amber-500" />}
                {rating === "Red" && <XCircle className="w-6 h-6 text-red-500" />}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-sm text-muted-foreground">Recommendation:</span>
                <span className={cn("text-sm font-bold px-3 py-1 rounded-full", recColor)}>
                  {recLabel}
                </span>
              </div>
            </div>
            <div className={cn(
              "text-center border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-5 w-full sm:w-auto shrink-0",
              rating === "Green" ? "border-emerald-200" : rating === "Yellow" ? "border-amber-200" : "border-red-200"
            )}>
              <div className="text-xs text-muted-foreground mb-0.5">Monthly Cash Flow</div>
              <div className={cn("text-2xl sm:text-3xl font-black", cashFlowPositive ? "text-emerald-700" : "text-red-700")}>
                {cashFlowPositive ? "+" : ""}{formatCurrency(results!.monthlyCashFlow)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">per month</div>
            </div>
          </div>
        </div>

        {/* Core financial metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Monthly Cash Flow" value={formatCurrency(results!.monthlyCashFlow)} positive={cashFlowPositive} />
          <MetricCard label="Annual Cash Flow" value={formatCurrency(results!.annualCashFlow)} positive={results!.annualCashFlow >= 0} />
          <MetricCard label="Cash-on-Cash Return" value={formatPercent(results!.cashOnCashReturn)} positive={results!.cashOnCashReturn >= 7} />
          <MetricCard label="DSCR" value={formatNumber(results!.dscr)} sub="≥1.25 is strong" positive={results!.dscr >= 1.25} />
          <MetricCard label="Cap Rate" value={formatPercent(results!.capRate)} positive={results!.capRate >= 6} />
          <MetricCard label="NOI (annual)" value={formatCurrency(results!.noi ?? 0)} />
          <MetricCard label="Monthly Mortgage" value={formatCurrency(results!.monthlyMortgage ?? 0)} />
          <MetricCard label="Total Expenses/mo" value={formatCurrency(results!.totalMonthlyExpenses ?? 0)} />
        </div>

        {/* Tax-enhanced metrics */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Tax-Enhanced Returns</span>
            <span className="ml-1 text-[10px] text-muted-foreground">(28% assumed bracket · see Tax tab)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MetricCard label="Annual Depreciation" value={formatCurrency(annualDepreciation)} sub="27.5yr schedule" />
            <MetricCard label="Est. Tax Savings/yr" value={formatCurrency(estimatedTaxSavings)} positive={true} />
            <MetricCard label="After-Tax Cash Flow" value={formatCurrency(afterTaxAnnualCashFlow)} positive={afterTaxAnnualCashFlow >= 0} sub="annual" />
          </div>
        </div>

        {/* Investment summary */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Investment Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
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
              <FieldRow key={label} label={label} value={value} />
            ))}
          </div>
        </div>

        {/* Equity & future potential */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Equity Position</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MetricCard
              label="Initial Equity"
              value={formatCurrency(deal!.downPayment + (deal!.rehabBudget ?? 0))}
              sub="Down payment + rehab"
            />
            <div className="bg-card border border-dashed border-border rounded-xl px-4 py-3.5">
              <div className="text-xs text-muted-foreground mb-1">Future Equity Potential</div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                <span className="text-sm text-muted-foreground/60 italic">ARV & appreciation model — Phase 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderProperty() {
    return (
      <div className="space-y-4">
        {/* Known data */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Home className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Property Details</h3>
          </div>
          <FieldRow label="Address" value={deal!.address} />
          <FieldRow label="Purchase Price" value={formatCurrency(deal!.purchasePrice)} />
          <FieldRow label="Monthly Rent" value={formatCurrency(deal!.estimatedRent)} />
          <FieldRow label="Rehab Budget" value={deal!.rehabBudget ? formatCurrency(deal!.rehabBudget) : null} />
        </div>

        <Phase2Card title="Property Characteristics" icon={Home} items={[
          "Property Type", "Bedrooms", "Bathrooms", "Square Footage",
          "Lot Size", "Year Built", "Stories", "Garage / Parking",
        ]} />

        <Phase2Card title="Parcel & Ownership Data" icon={FileText} items={[
          "Parcel / APN", "Zoning Classification", "Legal Description",
          "Current Owner", "Last Sale Price", "Last Sale Date",
        ]} />

        <Phase2Card title="Property History" icon={FileText} items={[
          "Ownership History", "Permit History", "Violation History",
          "Assessment History", "Insurance Claims", "HOA Records",
        ]} />

        {/* Photos placeholder */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Property Photos & Street View</span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded border border-border">Phase 2</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[1,2,3,4,5,6].map((n) => (
              <div key={n} className="aspect-square rounded-lg bg-muted/40 border border-dashed border-border flex items-center justify-center">
                <Home className="w-5 h-5 text-muted-foreground/20" />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/60 italic">Photo upload, Google Street View, and building sketch available in Phase 2.</p>
        </div>

        <Phase2Card title="Condition & Inspection" icon={ShieldAlert} items={[
          "Property Condition Grade", "Roof Age", "HVAC Age",
          "Plumbing Condition", "Electrical Condition", "Foundation Grade",
        ]} />
      </div>
    );
  }

  function renderLocation() {
    return (
      <div className="space-y-4">
        {/* Map placeholder */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="h-44 sm:h-56 bg-muted/40 flex flex-col items-center justify-center gap-2 border-b border-border">
            <Navigation className="w-8 h-8 text-muted-foreground/30" />
            <div className="text-center px-4">
              <p className="text-sm font-medium text-muted-foreground">{deal!.address}</p>
              <p className="text-xs text-muted-foreground/50 mt-0.5">Interactive map — Google Maps API in Phase 2</p>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded border border-border">Phase 2</span>
            <span className="text-xs text-muted-foreground">Walk Score · Bike Score · Transit Score</span>
          </div>
        </div>

        <Phase2Card title="Neighborhood Snapshot" icon={MapPin} items={[
          "Walk Score", "Bike Score", "Neighborhood Grade",
          "Population Density", "Median Household Income", "Crime Grade",
        ]} />

        <Phase2Card title="Transit Access" icon={Navigation} items={[
          "Bus Routes", "Train / Metro Access", "Airport Distance",
          "Highway Access", "Commute Time to CBD",
        ]} />

        <Phase2Card title="Nearby Amenities" icon={Navigation} items={[
          "Schools (K–12)", "Grocery Stores", "Restaurants",
          "Hospitals / Urgent Care", "Parks & Recreation",
          "Entertainment Districts", "Shopping Centers",
          "Gym / Fitness Centers",
        ]} />

        <Phase2Card title="Employment & Growth" icon={TrendingUp} items={[
          "Employment Centers", "Major Employers Nearby",
          "Population Growth (5yr)", "Job Growth Rate",
        ]} />

        <Phase2Card title="Environmental & Risk" icon={ShieldAlert} items={[
          "Flood Zone", "Wildfire Risk", "Earthquake Risk",
          "Air Quality Index", "Noise Level",
        ]} />
      </div>
    );
  }

  function renderMarket() {
    return (
      <div className="space-y-4">
        <div className="bg-accent/40 border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground flex items-start gap-2">
          <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
          <span>Market intelligence pulls from MLS comps, Zillow, and Rentometer in Phase 2. Fields will auto-populate once the property address is verified against parcel data.</span>
        </div>

        <Phase2Card title="After Repair Value (ARV)" icon={DollarSign} items={[
          "ARV Estimate", "Equity Created", "Spread to ARV",
          "ARV Confidence Level", "ARV Source",
        ]} />

        <Phase2Card title="Comparable Sales" icon={BarChart2} items={[
          "Nearest 3 Sold Comps", "Price per Sq Ft",
          "Median Sale Price (90 days)", "Days on Market",
          "List-to-Sale Ratio",
        ]} />

        <Phase2Card title="Comparable Rentals" icon={TrendingUp} items={[
          "Nearest 3 Rental Comps", "Rent per Sq Ft",
          "Median Market Rent", "Average Days to Lease",
          "Vacancy Rate",
        ]} />

        <Phase2Card title="Market Trends" icon={TrendingUp} items={[
          "12-Month Price Appreciation", "Rent Growth Rate",
          "Inventory Trend", "Absorption Rate",
          "Market Heat Score", "Appreciation Trend",
          "Seller vs Buyer Market",
        ]} />
      </div>
    );
  }

  function renderRisk() {
    const calcRisks = [
      {
        label: "Debt Service Coverage (DSCR)",
        detail: `${formatNumber(results!.dscr)} — ${results!.dscr < 1.0 ? "income does not cover debt" : results!.dscr < 1.25 ? "below lender threshold of 1.25" : "strong coverage"}`,
        level: results!.dscr >= 1.25 ? "Low" : results!.dscr >= 1.0 ? "Moderate" : "High",
      },
      {
        label: "Cash Flow",
        detail: `${formatCurrency(results!.monthlyCashFlow)}/mo — ${!cashFlowPositive ? "negative cash flow" : results!.monthlyCashFlow < 200 ? "thin margin" : "healthy buffer"}`,
        level: !cashFlowPositive ? "High" : results!.monthlyCashFlow < 200 ? "Moderate" : "Low",
      },
      {
        label: "Cap Rate",
        detail: `${formatPercent(results!.capRate)} — ${results!.capRate < 4 ? "below market threshold" : results!.capRate < 6 ? "at market rate" : "above market"}`,
        level: results!.capRate < 4 ? "High" : results!.capRate < 6 ? "Moderate" : "Low",
      },
      {
        label: "Leverage (LTV)",
        detail: `${formatPercent((1 - deal!.downPayment / deal!.purchasePrice) * 100)} LTV — ${deal!.downPayment / deal!.purchasePrice < 0.15 ? "very high leverage" : deal!.downPayment / deal!.purchasePrice < 0.25 ? "moderate leverage" : "conservative leverage"}`,
        level: deal!.downPayment / deal!.purchasePrice < 0.15 ? "High" : deal!.downPayment / deal!.purchasePrice < 0.25 ? "Moderate" : "Low",
      },
    ];

    const riskColor = (level: string) =>
      level === "High" ? "text-red-600" : level === "Moderate" ? "text-amber-600" : "text-emerald-600";
    const riskBg = (level: string) =>
      level === "High" ? "bg-red-50 border-red-200" : level === "Moderate" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200";

    return (
      <div className="space-y-4">
        {/* Calculated risks */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Financial Risk Assessment</h3>
          </div>
          <div className="space-y-0">
            {calcRisks.map(({ label, detail, level }) => (
              <div key={label} className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
                </div>
                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0", riskBg(level), riskColor(level))}>
                  {level} Risk
                </span>
              </div>
            ))}
          </div>
        </div>

        <Phase2Card title="Property Risk Factors" icon={ShieldAlert} items={[
          "Flood Risk Score", "Crime Index", "Insurance Risk Score",
          "Environmental Risk", "School Quality Index",
          "Natural Disaster Risk",
        ]} />

        <Phase2Card title="Investment Risk Factors" icon={BarChart2} items={[
          "Vacancy Risk", "Market Risk", "Neighborhood Risk",
          "DSCR Stress Test (+2% rate)", "Expense Creep Sensitivity",
          "Market Downside Scenario",
        ]} />
      </div>
    );
  }

  function renderStrategy() {
    return (
      <div className="space-y-4">
        <div className="bg-accent/40 border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground flex items-start gap-2">
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
          <span>Full strategy analysis with lender matching, exit modeling, and returns comparison coming in Phase 2. Below is a preliminary overview of applicable strategies.</span>
        </div>

        {[
          { name: "Buy & Hold", desc: "Long-term rental income and appreciation play." },
          { name: "BRRRR", desc: "Buy, Rehab, Rent, Refinance, Repeat — pull equity out for next deal." },
          { name: "Fix & Flip", desc: "Renovate and sell for profit. ARV spread is key metric." },
          { name: "House Hack", desc: "Owner occupies one unit, rents others to offset mortgage." },
          { name: "Short-Term Rental", desc: "Airbnb / VRBO — higher income potential, higher management overhead." },
          { name: "Mid-Term Rental", desc: "30+ day furnished rentals — traveling nurses, corporate." },
          { name: "Seller Financing", desc: "Seller acts as lender — flexible terms, no bank approval." },
          { name: "Subject-To", desc: "Take over seller's existing mortgage payments as-is." },
          { name: "Lease Option", desc: "Rent with option to purchase — lock in price today." },
          { name: "Commercial Conversion", desc: "Rezone or convert for commercial / mixed use." },
          { name: "Portfolio Fit", desc: "How this deal fits within your broader investment portfolio." },
        ].map(({ name, desc }) => (
          <div key={name} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded border border-border shrink-0">Phase 2</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderTax() {
    return (
      <div className="space-y-4">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Estimated values only.</strong> These calculations use standard IRS depreciation schedules and assumed values. Phase 2 will use assessor and parcel data for precise figures. Consult a CPA or tax advisor before making decisions.
          </span>
        </div>

        {/* Core depreciation */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Depreciation Analysis</h3>
            <span className="ml-auto text-xs text-muted-foreground">Residential · 27.5yr schedule</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-4">
            <FieldRow label="Purchase Price" value={formatCurrency(deal!.purchasePrice)} />
            <FieldRow label="Estimated Building Value (80%)" value={formatCurrency(buildingValue)} />
            <FieldRow label="Estimated Land Value (20%)" value={formatCurrency(landValue)} />
            <FieldRow label="Depreciation Schedule" value="27.5 years (residential)" />
            <FieldRow label="Annual Depreciation" value={formatCurrency(annualDepreciation)} />
            <FieldRow label="Monthly Depreciation" value={formatCurrency(annualDepreciation / 12)} />
          </div>

          <div className="bg-muted/30 rounded-lg px-4 py-3 text-xs text-muted-foreground">
            <strong>Formula:</strong> Annual Depreciation = Building Value ÷ 27.5<br />
            = {formatCurrency(buildingValue)} ÷ 27.5 = <strong>{formatCurrency(annualDepreciation)}/year</strong>
          </div>
        </div>

        {/* Tax savings */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-foreground">Tax Savings Estimate</h3>
            <span className="ml-auto text-xs text-muted-foreground">28% bracket assumed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-4">
            <FieldRow label="Annual Depreciation" value={formatCurrency(annualDepreciation)} />
            <FieldRow label="Assumed Tax Bracket" value="28%" />
            <FieldRow label="Estimated Tax Savings/yr" value={formatCurrency(estimatedTaxSavings)} />
            <FieldRow label="Estimated Tax Savings/mo" value={formatCurrency(estimatedTaxSavings / 12)} />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-xs text-emerald-700">
            Depreciation reduces your taxable income by <strong>{formatCurrency(annualDepreciation)}/year</strong>,
            saving approximately <strong>{formatCurrency(estimatedTaxSavings)}/year</strong> in federal taxes (at 28% marginal rate).
          </div>
        </div>

        {/* After-tax cash flow */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">After-Tax Returns</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <MetricCard label="Pre-Tax Cash Flow (annual)" value={formatCurrency(results!.annualCashFlow)} positive={results!.annualCashFlow >= 0} />
            <MetricCard label="Est. Tax Savings (annual)" value={formatCurrency(estimatedTaxSavings)} positive={true} />
            <MetricCard
              label="After-Tax Cash Flow (annual)"
              value={formatCurrency(afterTaxAnnualCashFlow)}
              positive={afterTaxAnnualCashFlow >= 0}
              sub="Pre-tax CF + tax savings"
            />
            <MetricCard
              label="Tax-Adjusted CoC Return"
              value={formatPercent(taxAdjustedCoC)}
              positive={taxAdjustedCoC >= 7}
              sub={`vs ${formatPercent(results!.cashOnCashReturn)} pre-tax`}
            />
          </div>

          <div className="bg-muted/30 rounded-lg px-4 py-3 text-xs text-muted-foreground">
            After-Tax Cash Flow = Pre-Tax Cash Flow + Estimated Tax Savings<br />
            = {formatCurrency(results!.annualCashFlow)} + {formatCurrency(estimatedTaxSavings)} = <strong>{formatCurrency(afterTaxAnnualCashFlow)}/year</strong>
          </div>
        </div>

        <Phase2Card title="Phase 2 — CPA-Grade Tax Intelligence" icon={FileText} items={[
          "Assessor-verified building/land split",
          "Commercial depreciation (39yr)",
          "Bonus depreciation analysis",
          "Cost segregation estimate",
          "State & local tax impact",
          "1031 exchange eligibility",
          "Passive activity rules",
          "QBI deduction estimate",
        ]} />
      </div>
    );
  }

  function renderNotes() {
    return (
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <StickyNote className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Deal Notes</h3>
          </div>
          {deal!.notes ? (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{deal!.notes}</p>
          ) : (
            <div className="text-center py-8">
              <StickyNote className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notes added for this deal.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Notes can be added when submitting a deal.</p>
            </div>
          )}
        </div>

        {[
          { title: "Property Notes", desc: "Condition, repairs observed, agent comments, showing notes" },
          { title: "Rehab Notes", desc: "Scope of work, contractor bids, timeline estimates" },
          { title: "Acquisition Notes", desc: "Offer history, seller motivation, negotiation strategy" },
          { title: "Investment Notes", desc: "Portfolio thesis, exit strategy, hold period notes" },
          { title: "Collaboration Notes", desc: "Partner notes, lender comments, team feedback — Phase 2" },
        ].map(({ title, desc }) => (
          <div key={title} className="bg-card border border-dashed border-border rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-foreground">{title}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded border border-border">Phase 2</span>
            </div>
            <p className="text-xs text-muted-foreground/60 italic">{desc}</p>
          </div>
        ))}

        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Deal Timeline</span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded border border-border">Phase 2</span>
          </div>
          <div className="space-y-3">
            {["Offer Submitted", "Inspection Scheduled", "Appraisal Ordered", "Clear to Close", "Funded / Closed"].map((step) => (
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
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">AI Deal Coach</span>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">Rule-Based · Phase 2: GPT</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Currently running rule-based analysis from your deal metrics. Phase 2 upgrades to GPT-4o for a full investor-grade intelligence brief — connect your OpenAI key in Settings to unlock.
          </p>
        </div>

        {/* Strengths */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-foreground">Deal Strengths</span>
          </div>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-foreground">Weaknesses</span>
          </div>
          <ul className="space-y-2">
            {weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                {w}
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Flags */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-foreground">Risk Flags</span>
          </div>
          <ul className="space-y-2">
            {riskFlags.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Negotiation Suggestions */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-foreground">Negotiation Suggestions</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {rating === "Green"
              ? `Strong deal at current terms. You have leverage — consider requesting seller concessions on closing costs. Locking in a rate buy-down could improve long-term returns further.`
              : rating === "Yellow"
              ? `Request a purchase price reduction of 5–8% or ask for seller concessions on closing costs to improve cash flow. Verify rent assumptions with local comps before committing.`
              : `At current purchase price this deal does not pencil. A 10–15% price reduction or significant rent increase would be required to reach viability. Set a target price and monitor for relist.`}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Lock className="w-3 h-3 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/60 italic">Detailed negotiation playbook with scripts — Phase 2</span>
          </div>
        </div>

        {/* Financing Notes */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-semibold text-foreground">Financing Notes</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {`With a ${formatPercent((deal!.downPayment / deal!.purchasePrice) * 100)} down payment and DSCR of ${formatNumber(results!.dscr)}, `}
            {results!.dscr >= 1.25
              ? "this deal qualifies for conventional and DSCR loan products. Shop multiple lenders to compare rates."
              : results!.dscr >= 1.0
              ? "some DSCR lenders will approve at this coverage ratio. Expect higher rates or larger down payment requirements."
              : "DSCR financing will be difficult below 1.0 coverage. Explore seller financing, private money, or renegotiate purchase terms."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Lock className="w-3 h-3 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/60 italic">Live lender rate quotes and pre-qual — Phase 2</span>
          </div>
        </div>

        {/* Exit Strategy Ideas */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-foreground">Exit Strategy Ideas</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {rating === "Green"
              ? "Primary exit: hold long-term for cash flow and appreciation. Secondary exit: BRRRR refinance if rehabbing — pull equity for next acquisition. Tertiary: sell after 3–5 years at appreciation premium."
              : "Primary consideration: ensure you can exit profitably. With current metrics, a forced sale could result in a loss. Verify exit cap rates in the local market before committing."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Lock className="w-3 h-3 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/60 italic">Full exit modeling with IRR projections — Phase 2</span>
          </div>
        </div>

        {/* Investor Considerations */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Investor Considerations</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />Verify all rent estimates against local Rentometer data before closing</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />Factor in 5–8% vacancy rate and 10% management fee if not self-managing</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />Order an independent inspection — budget for deferred maintenance</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />Confirm insurance cost with 2–3 carriers before closing</li>
            <li className="flex items-start gap-2"><Lock className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" /><span className="text-muted-foreground/50 italic">GPT-powered investor profile matching — Phase 2</span></li>
          </ul>
        </div>

        <button disabled className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground/40 px-4 py-3 border border-dashed border-border rounded-xl cursor-not-allowed bg-muted/20">
          <Sparkles className="w-4 h-4" />
          Connect OpenAI to Unlock Full GPT-4o Analysis (Phase 2)
        </button>
      </div>
    );
  }

  const tabContent: Record<TabKey, () => React.ReactNode> = {
    investment: renderInvestment,
    property:   renderProperty,
    location:   renderLocation,
    market:     renderMarket,
    risk:       renderRisk,
    strategy:   renderStrategy,
    tax:        renderTax,
    notes:      renderNotes,
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

        {/* ── Tab Bar ── */}
        <div className="mb-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-0.5 bg-muted/50 rounded-xl p-1 border border-border">
            {TABS.map(({ key, label: tabLabel, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                  activeTab === key
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
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
        <div>{tabContent[activeTab]()}</div>

        {/* ── Full Report Upgrade ── */}
        <div className="mt-5 bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Full Investor Report — PDF Export</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded border border-border">Phase 2</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Professionally formatted PDF with executive summary, comparable analysis, full risk assessment, CPA-grade tax analysis, AI narrative, and lender-ready documentation package.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button disabled className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground/40 px-4 py-2 border border-dashed border-border rounded-lg cursor-not-allowed bg-muted/20">
              <Lock className="w-3.5 h-3.5" />
              Unlock Full Report — $49 (Coming Soon)
            </button>
            <span className="text-xs text-muted-foreground">Powered by Stripe · Phase 2</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
