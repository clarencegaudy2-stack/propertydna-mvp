import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import Layout from "@/components/layout";
import {
  useAdminListDeals,
  useAdminUpdateDealStatus,
  getAdminListDealsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, cn } from "@/lib/utils";
import { ShieldCheck, MapPin, ChevronRight } from "lucide-react";

const STATUSES = ["NEW", "PAID", "IN_PROGRESS", "COMPLETED"] as const;
type DealStatus = typeof STATUSES[number];

const statusLabels: Record<DealStatus, string> = {
  NEW: "New",
  PAID: "Paid",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

const statusColors: Record<DealStatus, string> = {
  NEW: "bg-slate-100 text-slate-600",
  PAID: "bg-blue-50 text-blue-600",
  IN_PROGRESS: "bg-amber-50 text-amber-600",
  COMPLETED: "bg-emerald-50 text-emerald-700",
};

const ratingColors: Record<string, string> = {
  Green: "text-emerald-600 font-bold",
  Yellow: "text-amber-600 font-bold",
  Red: "text-red-600 font-bold",
};

export default function AdminPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { data: deals, isLoading } = useAdminListDeals();
  const updateStatus = useAdminUpdateDealStatus();

  if (!user) { navigate("/login"); return null; }

  function handleStatusChange(id: number, status: DealStatus) {
    updateStatus.mutate(
      { id, data: { status } },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getAdminListDealsQueryKey() }) }
    );
  }

  const total = deals?.length ?? 0;
  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = deals?.filter((d) => d.status === s).length ?? 0;
    return acc;
  }, {} as Record<DealStatus, number>);

  return (
    <Layout title="Admin">
      <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-7 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Admin Dashboard</h1>
        </div>

        {/* Status summary — scrollable row on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          <div className="bg-card border border-border rounded-xl px-4 py-3 text-center">
            <div className="text-xl font-bold text-foreground">{total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          {STATUSES.map((s) => (
            <div key={s} className="bg-card border border-border rounded-xl px-4 py-3 text-center">
              <div className={cn("text-xl font-bold", statusColors[s].split(" ")[1])}>{byStatus[s]}</div>
              <div className="text-xs text-muted-foreground">{statusLabels[s]}</div>
            </div>
          ))}
        </div>

        {/* Deals — card list on mobile, table on desktop */}
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">All Property Deals</h2>
            <span className="text-xs text-muted-foreground">{total} total</span>
          </div>

          {isLoading ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">Loading deals...</div>
          ) : !deals || deals.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">No deals submitted yet.</div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="divide-y divide-border lg:hidden">
                {deals.map((deal) => (
                  <div key={deal.id} className="px-4 py-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{deal.address}</p>
                          <p className="text-[11px] text-muted-foreground">#{deal.id} · {new Date(deal.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Link href={`/deals/${deal.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium shrink-0">
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                      <span className="text-muted-foreground">{formatCurrency(deal.purchasePrice)} · {formatCurrency(deal.estimatedRent)}/mo</span>
                      <span className={cn(ratingColors[deal.dealRating ?? ""] ?? "text-muted-foreground")}>
                        {deal.dealRating ?? "—"} · Score {deal.dealScore?.toFixed(0) ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Status:</span>
                      <select
                        value={deal.status}
                        onChange={(e) => handleStatusChange(deal.id, e.target.value as DealStatus)}
                        className={cn(
                          "text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring",
                          statusColors[deal.status as DealStatus] ?? "bg-muted text-muted-foreground"
                        )}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Property</th>
                      <th className="text-right px-4 py-3">Purchase</th>
                      <th className="text-right px-4 py-3">Rent</th>
                      <th className="text-center px-4 py-3">Score</th>
                      <th className="text-center px-4 py-3">Rating</th>
                      <th className="text-center px-4 py-3">Rec.</th>
                      <th className="text-center px-4 py-3">Status</th>
                      <th className="text-right px-6 py-3">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {deals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{deal.address}</p>
                              <p className="text-[11px] text-muted-foreground">#{deal.id} · {new Date(deal.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">{formatCurrency(deal.purchasePrice)}</td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">{formatCurrency(deal.estimatedRent)}/mo</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-foreground">{deal.dealScore?.toFixed(0) ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("text-sm", ratingColors[deal.dealRating ?? ""] ?? "text-muted-foreground")}>
                            {deal.dealRating ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-muted-foreground">{deal.recommendation ?? "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={deal.status}
                            onChange={(e) => handleStatusChange(deal.id, e.target.value as DealStatus)}
                            className={cn(
                              "text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring",
                              statusColors[deal.status as DealStatus] ?? "bg-muted text-muted-foreground"
                            )}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{statusLabels[s]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Link href={`/deals/${deal.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                            View <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
