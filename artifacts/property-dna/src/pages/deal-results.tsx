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
  MapPin,
  Bot,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  BarChart2,
} from "lucide-react";

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
  const color = pct >= 70 ? "#10b981" : pct >= 45 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 52;
  const dash = (pct / 100) * circumference;
  return (
    <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="52"
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-black text-foreground">{score.toFixed(0)}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
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
      <div className={cn(
        "text-base sm:text-lg font-bold leading-tight",
        positive === true ? "text-emerald-600" :
        positive === false ? "text-red-600" : "text-foreground"
      )}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export default function DealResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();
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
      <Layout title="Deal Results">
        <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
          Loading deal analysis...
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

  const isGreen = results.dealRating === "Green";
  const isYellow = results.dealRating === "Yellow";
  const cashFlowPositive = results.monthlyCashFlow >= 0;

  return (
    <Layout title="Deal Analysis">
      <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-7 max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-foreground leading-tight">{deal.address}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {formatCurrency(deal.purchasePrice)} · {deal.loanTerm}yr @ {deal.interestRate}% · {formatCurrency(deal.estimatedRent)}/mo
              </p>
            </div>
          </div>
          <StatusBadge status={deal.status} />
        </div>

        {/* Verdict card */}
        <div className={cn(
          "rounded-2xl border p-4 sm:p-6 mb-5",
          isGreen ? "bg-emerald-50 border-emerald-200" :
          isYellow ? "bg-amber-50 border-amber-200" :
          "bg-red-50 border-red-200"
        )}>
          {/* Mobile: stacked; Desktop: row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <ScoreGauge score={results.dealScore} />

            <div className="flex-1 text-center sm:text-left">
              <div className={cn("text-xs font-semibold uppercase tracking-widest mb-1",
                isGreen ? "text-emerald-600" : isYellow ? "text-amber-600" : "text-red-600"
              )}>Deal Rating</div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                <span className={cn("text-3xl font-black",
                  isGreen ? "text-emerald-700" : isYellow ? "text-amber-700" : "text-red-700"
                )}>
                  {results.dealRating}
                </span>
                {isGreen && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                {isYellow && <AlertTriangle className="w-6 h-6 text-amber-500" />}
                {!isGreen && !isYellow && <XCircle className="w-6 h-6 text-red-500" />}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-sm text-muted-foreground">Recommendation:</span>
                <span className={cn(
                  "text-sm font-bold px-3 py-1 rounded-full",
                  results.recommendation === "Buy" ? "bg-emerald-100 text-emerald-700" :
                  results.recommendation === "Review" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                )}>
                  {results.recommendation}
                </span>
              </div>
            </div>

            {/* Cash flow — moves below on mobile */}
            <div className="text-center sm:text-right w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-current/10 pt-3 sm:pt-0 sm:pl-4">
              <div className="text-xs text-muted-foreground mb-1">Monthly Cash Flow</div>
              <div className={cn("text-2xl sm:text-3xl font-black", cashFlowPositive ? "text-emerald-700" : "text-red-700")}>
                {cashFlowPositive ? "+" : ""}{formatCurrency(results.monthlyCashFlow)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">per month</div>
            </div>
          </div>
        </div>

        {/* Metrics — 2-col mobile, 4-col desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <MetricCard label="Monthly Cash Flow" value={formatCurrency(results.monthlyCashFlow)} positive={cashFlowPositive} />
          <MetricCard label="Annual Cash Flow" value={formatCurrency(results.annualCashFlow)} positive={results.annualCashFlow >= 0} />
          <MetricCard label="Cash-on-Cash" value={formatPercent(results.cashOnCashReturn)} positive={results.cashOnCashReturn >= 7} />
          <MetricCard label="DSCR" value={formatNumber(results.dscr)} sub="≥1.25 is strong" positive={results.dscr >= 1.25} />
          <MetricCard label="Cap Rate" value={formatPercent(results.capRate)} positive={results.capRate >= 6} />
          <MetricCard label="NOI (annual)" value={formatCurrency(results.noi)} />
          <MetricCard label="Monthly Mortgage" value={formatCurrency(results.monthlyMortgage)} />
          <MetricCard label="Total Expenses/mo" value={formatCurrency(results.totalMonthlyExpenses)} />
        </div>

        {/* Investment summary */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Investment Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
            {[
              { label: "Purchase Price", value: formatCurrency(deal.purchasePrice) },
              { label: "Down Payment", value: formatCurrency(deal.downPayment) },
              { label: "Loan Amount", value: formatCurrency(deal.purchasePrice - deal.downPayment) },
              { label: "Rehab Budget", value: formatCurrency(deal.rehabBudget) },
              { label: "Closing Costs", value: formatCurrency(deal.closingCosts) },
              { label: "Total Cash In", value: formatCurrency(results.totalInvestment) },
              { label: "Interest Rate", value: formatPercent(deal.interestRate) },
              { label: "Loan Term", value: `${deal.loanTerm} years` },
              { label: "Monthly Rent", value: formatCurrency(deal.estimatedRent) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Deal Coach — FUTURE: OpenAI Phase 2 */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">AI Deal Coach</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">Phase 2</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            GPT-4 powered analysis with personalized recommendations, risk flags, and negotiation tips.
          </p>
          <div className="bg-muted/50 rounded-lg px-4 py-3 border border-border">
            <p className="text-xs text-muted-foreground/70 italic">
              "This deal shows a DSCR of {formatNumber(results.dscr)}, which means the income {results.dscr >= 1 ? "covers" : "doesn't fully cover"} debt service. {results.dscr < 1.25 ? "Consider negotiating the purchase price down or finding ways to increase rental income before proceeding..." : "Strong debt coverage — good income support relative to debt obligations."}"
            </p>
          </div>
          <button disabled className="mt-3 text-xs font-medium text-muted-foreground/50 px-3 py-1.5 border border-border rounded-md cursor-not-allowed">
            Get Full AI Analysis (Coming Soon)
          </button>
        </div>

        {/* Stripe upgrade — FUTURE: Phase 2 */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Upgrade to Full Report</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">Phase 2</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Unlock a professionally formatted PDF report with executive summary, risk analysis, and lender-ready documentation.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button disabled className="text-xs font-semibold text-muted-foreground/50 px-4 py-2 border border-border rounded-md cursor-not-allowed bg-muted/30">
              Unlock Full Report — $49 (Coming Soon)
            </button>
            <span className="text-xs text-muted-foreground">Powered by Stripe</span>
          </div>
        </div>

        {deal.notes && (
          <div className="mt-3 bg-muted/50 border border-border rounded-xl px-4 sm:px-5 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Notes</p>
            <p className="text-sm text-foreground">{deal.notes}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
