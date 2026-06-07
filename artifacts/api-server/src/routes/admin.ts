import { Router } from "express";
import { db } from "@workspace/db";
import { dealsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { AdminUpdateDealStatusParams, AdminUpdateDealStatusBody } from "@workspace/api-zod";

const router = Router();

function parseDeal(deal: typeof dealsTable.$inferSelect) {
  return {
    id: deal.id,
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

// GET /admin/deals — all deals across all users
router.get("/deals", async (_req, res) => {
  const deals = await db
    .select()
    .from(dealsTable)
    .orderBy(desc(dealsTable.createdAt));
  res.json(deals.map(parseDeal));
});

// PATCH /admin/deals/:id/status — update report status
router.patch("/deals/:id/status", async (req, res) => {
  const { id } = AdminUpdateDealStatusParams.parse({ id: Number(req.params.id) });
  const body = AdminUpdateDealStatusBody.parse(req.body);

  const [updated] = await db
    .update(dealsTable)
    .set({ status: body.status as "NEW" | "PAID" | "IN_PROGRESS" | "COMPLETED" })
    .where(eq(dealsTable.id, id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Deal not found" });
  res.json(parseDeal(updated));
});

export default router;
