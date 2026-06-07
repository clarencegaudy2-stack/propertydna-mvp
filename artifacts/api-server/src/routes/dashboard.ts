import { Router } from "express";
import { db } from "@workspace/db";
import { dealsTable } from "@workspace/db";
import { desc, count, avg, eq, and } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../middlewares/auth.js";

const router = Router();

function parseDeal(deal: typeof dealsTable.$inferSelect) {
  return {
    id: deal.id,
    userId: deal.userId ?? null,
    address: deal.address,
    purchasePrice: Number(deal.purchasePrice),
    estimatedRent: Number(deal.estimatedRent),
    taxes: Number(deal.taxes ?? 0),
    insurance: Number(deal.insurance ?? 0),
    hoa: Number(deal.hoa ?? 0),
    maintenance: Number(deal.maintenance ?? 0),
    propertyManagement: Number(deal.propertyManagement ?? 0),
    utilities: Number(deal.utilities ?? 0),
    downPayment: Number(deal.downPayment),
    interestRate: Number(deal.interestRate),
    loanTerm: deal.loanTerm,
    rehabBudget: Number(deal.rehabBudget ?? 0),
    closingCosts: Number(deal.closingCosts ?? 0),
    notes: deal.notes ?? null,
    status: deal.status,
    dealScore: deal.dealScore !== null ? Number(deal.dealScore) : null,
    dealRating: deal.dealRating ?? null,
    recommendation: deal.recommendation ?? null,
    createdAt: deal.createdAt.toISOString(),
  };
}

// GET /dashboard/stats — scoped to current user
router.get("/stats", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const userFilter = eq(dealsTable.userId, userId);

  const [statsRow] = await db
    .select({
      totalDeals: count(dealsTable.id),
      avgDealScore: avg(dealsTable.dealScore),
    })
    .from(dealsTable)
    .where(userFilter);

  const statusCounts = await db
    .select({ status: dealsTable.status, cnt: count(dealsTable.id) })
    .from(dealsTable)
    .where(userFilter)
    .groupBy(dealsTable.status);

  const ratingCounts = await db
    .select({ rating: dealsTable.dealRating, cnt: count(dealsTable.id) })
    .from(dealsTable)
    .where(and(userFilter))
    .groupBy(dealsTable.dealRating);

  const recentDeals = await db
    .select()
    .from(dealsTable)
    .where(userFilter)
    .orderBy(desc(dealsTable.createdAt))
    .limit(5);

  const statusMap: Record<string, number> = {};
  for (const row of statusCounts) statusMap[row.status] = Number(row.cnt);

  const ratingMap: Record<string, number> = {};
  for (const row of ratingCounts) {
    if (row.rating) ratingMap[row.rating] = Number(row.cnt);
  }

  res.json({
    totalDeals: Number(statsRow.totalDeals),
    newDeals: statusMap["NEW"] ?? 0,
    inProgressDeals: statusMap["IN_PROGRESS"] ?? 0,
    completedDeals: statusMap["COMPLETED"] ?? 0,
    avgDealScore: statsRow.avgDealScore ? Math.round(Number(statsRow.avgDealScore) * 10) / 10 : 0,
    greenDeals: ratingMap["Green"] ?? 0,
    yellowDeals: ratingMap["Yellow"] ?? 0,
    redDeals: ratingMap["Red"] ?? 0,
    recentDeals: recentDeals.map(parseDeal),
  });
});

export default router;
