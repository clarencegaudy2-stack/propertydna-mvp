import { Router } from "express";
import { db } from "@workspace/db";
import { dealsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { AdminUpdateDealStatusParams, AdminUpdateDealStatusBody } from "@workspace/api-zod";
import { requireAuth, requireAdmin, type AuthedRequest } from "../middlewares/auth.js";

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

async function checkIsAdmin(userId: string): Promise<boolean> {
  const [user] = await db.select({ isAdmin: usersTable.isAdmin }).from(usersTable).where(eq(usersTable.id, userId));
  return user?.isAdmin ?? false;
}

// GET /admin/deals — all deals across all users (admin only)
router.get("/deals", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const isAdmin = await checkIsAdmin(userId);
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  const deals = await db.select().from(dealsTable).orderBy(desc(dealsTable.createdAt));
  res.json(deals.map(parseDeal));
});

// PATCH /admin/deals/:id/status — update report status (admin only)
router.patch("/deals/:id/status", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const isAdmin = await checkIsAdmin(userId);
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

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

// GET /admin/users — all users (admin only)
router.get("/users", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const isAdmin = await checkIsAdmin(userId);
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(users);
});

// PATCH /admin/users/:id/admin — grant/revoke admin (admin only)
router.patch("/users/:id/admin", requireAuth, async (req, res) => {
  const requesterId = (req as AuthedRequest).userId;
  const isAdmin = await checkIsAdmin(requesterId);
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  const { id } = req.params;
  const { isAdmin: newValue } = req.body as { isAdmin: boolean };

  const [updated] = await db
    .update(usersTable)
    .set({ isAdmin: Boolean(newValue) })
    .where(eq(usersTable.id, id))
    .returning();

  if (!updated) return res.status(404).json({ error: "User not found" });
  res.json(updated);
});

export default router;
