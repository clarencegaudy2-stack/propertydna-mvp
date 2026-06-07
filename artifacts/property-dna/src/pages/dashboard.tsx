import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import Layout from "@/components/layout";
import { useListDeals, useGetDashboardStats } from "@workspace/api-client-react";
import { formatCurrency, cn } from "@/lib/utils";
import { ratingLabel, RATING_BADGE_CLASS } from "@/lib/ratings";
import {
  PlusCircle,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    NEW: { label: "New", cls: "bg-slate-100 text-slate-600 border-slate-200" },
    PAID: { label: "Paid", cls: "bg-blue-50 text-blue-600 border-blue-200" },
    IN_PROGRESS: { label: "In Progress", cls: "bg-amber-50 text-amber-600 border-amber-200" },
    COMPLETED: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  };
  const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={cn("inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap", s.cls)}>
      {s.label}
    </span>
  );
}

function RatingBadge({ rating }: { rating: string | null }) {
  if (!rating) return null;
  return (
    <span className={cn(
      "inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap",
      RATING_BADGE_CLASS[rating] ?? "bg-muted text-muted-foreground"
    )}>
      {ratingLabel(rating)}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: deals, isLoading: dealsLoading } = useListDeals();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <Layout title="Dashboard">
      <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-7 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Here's a summary of your deal pipeline.</p>
          </div>
          <Link
            href="/deals/new"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4" />
            New Analysis
          </Link>
        </div>

        {/* Stats — 2-col on mobile, 4-col on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total Deals", value: statsLoading ? "—" : stats?.totalDeals ?? 0, icon: FileText, sub: "all time" },
            { label: "Avg Score", value: statsLoading ? "—" : (stats?.avgDealScore ?? 0).toFixed(1), icon: TrendingUp, sub: "out of 100" },
            { label: "In Progress", value: statsLoading ? "—" : stats?.inProgressDeals ?? 0, icon: Clock, sub: "active" },
            { label: "Completed", value: statsLoading ? "—" : stats?.completedDeals ?? 0, icon: CheckCircle2, sub: "finished" },
          ].map(({ label, value, icon: Icon, sub }) => (
            <div key={label} className="bg-card border border-border rounded-xl px-4 py-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground leading-tight">{label}</span>
                <Icon className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              </div>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* Rating breakdown */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Strong Deals", value: stats.greenDeals, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", desc: "Score 70+" },
              { label: "Review Needed", value: stats.yellowDeals, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", desc: "Score 45–69" },
              { label: "Reject", value: stats.redDeals, color: "text-red-600", bg: "bg-red-50 border-red-200", desc: "Score 0–44" },
            ].map(({ label, value, color, bg, desc }) => (
              <div key={label} className={cn("border rounded-xl px-4 py-3.5", bg)}>
                <div className={cn("text-xl sm:text-2xl font-bold mb-0.5", color)}>{value}</div>
                <div className="text-xs sm:text-sm font-semibold text-foreground">{label}</div>
                <div className="text-[11px] text-muted-foreground hidden sm:block">{desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Deals list */}
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">All Deals</h2>
            <Link href="/deals/new" className="text-xs text-primary hover:underline font-medium whitespace-nowrap">
              + New Deal
            </Link>
          </div>

          {dealsLoading ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">Loading deals...</div>
          ) : !deals || deals.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No deals yet</p>
              <p className="text-xs text-muted-foreground mb-4">Submit your first property deal to see results here.</p>
              <Link href="/deals/new" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <PlusCircle className="w-3.5 h-3.5" /> Submit your first deal
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/deals/${deal.id}`)}
                >
                  <div className="hidden sm:flex w-9 h-9 rounded-lg bg-accent items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{deal.address}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {formatCurrency(deal.purchasePrice)} · {formatCurrency(deal.estimatedRent)}/mo
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <RatingBadge rating={deal.dealRating ?? null} />
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-foreground leading-none">{deal.dealScore?.toFixed(0) ?? "—"}</div>
                      <div className="text-[10px] text-muted-foreground">score</div>
                    </div>
                    <div className="sm:hidden text-sm font-bold text-foreground">{deal.dealScore?.toFixed(0) ?? "—"}</div>
                    <StatusBadge status={deal.status} />
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
