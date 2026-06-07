import { Router } from "express";
import { db } from "@workspace/db";
import { dealsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateDealBody,
  UpdateDealBody,
  GetDealParams,
  UpdateDealParams,
  DeleteDealParams,
  GetDealResultsParams,
} from "@workspace/api-zod";
import { calculateDeal } from "../lib/calculator.js";

const router = Router();

// Helper to parse numeric DB strings to numbers
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

// GET /deals — list all deals
router.get("/", async (_req, res) => {
  const deals = await db
    .select()
    .from(dealsTable)
    .orderBy(desc(dealsTable.createdAt));
  res.json(deals.map(parseDeal));
});

// POST /deals — create a new deal
router.post("/", async (req, res) => {
  const body = CreateDealBody.parse(req.body);

  // Calculate deal metrics on creation
  const results = calculateDeal({
    purchasePrice: body.purchasePrice,
    estimatedRent: body.estimatedRent,
    taxes: body.taxes ?? 0,
    insurance: body.insurance ?? 0,
    hoa: body.hoa ?? 0,
    maintenance: body.maintenance ?? 0,
    propertyManagement: body.propertyManagement ?? 0,
    utilities: body.utilities ?? 0,
    downPayment: body.downPayment,
    interestRate: body.interestRate,
    loanTerm: body.loanTerm,
    rehabBudget: body.rehabBudget ?? 0,
    closingCosts: body.closingCosts ?? 0,
  });

  const [deal] = await db
    .insert(dealsTable)
    .values({
      address: body.address,
      purchasePrice: String(body.purchasePrice),
      estimatedRent: String(body.estimatedRent),
      taxes: String(body.taxes ?? 0),
      insurance: String(body.insurance ?? 0),
      hoa: String(body.hoa ?? 0),
      maintenance: String(body.maintenance ?? 0),
      propertyManagement: String(body.propertyManagement ?? 0),
      utilities: String(body.utilities ?? 0),
      downPayment: String(body.downPayment),
      interestRate: String(body.interestRate),
      loanTerm: body.loanTerm,
      rehabBudget: String(body.rehabBudget ?? 0),
      closingCosts: String(body.closingCosts ?? 0),
      notes: body.notes ?? null,
      status: "NEW",
      dealScore: String(results.dealScore),
      dealRating: results.dealRating,
      recommendation: results.recommendation,
    })
    .returning();

  res.status(201).json(parseDeal(deal));
});

// GET /deals/:id — get single deal
router.get("/:id", async (req, res) => {
  const { id } = GetDealParams.parse({ id: Number(req.params.id) });
  const [deal] = await db.select().from(dealsTable).where(eq(dealsTable.id, id));
  if (!deal) return res.status(404).json({ error: "Deal not found" });
  res.json(parseDeal(deal));
});

// PATCH /deals/:id — update deal
router.patch("/:id", async (req, res) => {
  const { id } = UpdateDealParams.parse({ id: Number(req.params.id) });
  const body = UpdateDealBody.parse(req.body);

  const [existing] = await db.select().from(dealsTable).where(eq(dealsTable.id, id));
  if (!existing) return res.status(404).json({ error: "Deal not found" });

  // Re-calculate with merged values
  const merged = { ...parseDeal(existing), ...body };
  const results = calculateDeal({
    purchasePrice: merged.purchasePrice,
    estimatedRent: merged.estimatedRent,
    taxes: merged.taxes ?? 0,
    insurance: merged.insurance ?? 0,
    hoa: merged.hoa ?? 0,
    maintenance: merged.maintenance ?? 0,
    propertyManagement: merged.propertyManagement ?? 0,
    utilities: merged.utilities ?? 0,
    downPayment: merged.downPayment,
    interestRate: merged.interestRate,
    loanTerm: merged.loanTerm,
    rehabBudget: merged.rehabBudget ?? 0,
    closingCosts: merged.closingCosts ?? 0,
  });

  const updateValues: Record<string, unknown> = {};
  if (body.address !== undefined) updateValues.address = body.address;
  if (body.purchasePrice !== undefined) updateValues.purchasePrice = String(body.purchasePrice);
  if (body.estimatedRent !== undefined) updateValues.estimatedRent = String(body.estimatedRent);
  if (body.taxes !== undefined) updateValues.taxes = String(body.taxes);
  if (body.insurance !== undefined) updateValues.insurance = String(body.insurance);
  if (body.hoa !== undefined) updateValues.hoa = String(body.hoa);
  if (body.maintenance !== undefined) updateValues.maintenance = String(body.maintenance);
  if (body.propertyManagement !== undefined) updateValues.propertyManagement = String(body.propertyManagement);
  if (body.utilities !== undefined) updateValues.utilities = String(body.utilities);
  if (body.downPayment !== undefined) updateValues.downPayment = String(body.downPayment);
  if (body.interestRate !== undefined) updateValues.interestRate = String(body.interestRate);
  if (body.loanTerm !== undefined) updateValues.loanTerm = body.loanTerm;
  if (body.rehabBudget !== undefined) updateValues.rehabBudget = String(body.rehabBudget);
  if (body.closingCosts !== undefined) updateValues.closingCosts = String(body.closingCosts);
  if (body.notes !== undefined) updateValues.notes = body.notes;

  updateValues.dealScore = String(results.dealScore);
  updateValues.dealRating = results.dealRating;
  updateValues.recommendation = results.recommendation;

  const [updated] = await db
    .update(dealsTable)
    .set(updateValues)
    .where(eq(dealsTable.id, id))
    .returning();

  res.json(parseDeal(updated));
});

// DELETE /deals/:id
router.delete("/:id", async (req, res) => {
  const { id } = DeleteDealParams.parse({ id: Number(req.params.id) });
  await db.delete(dealsTable).where(eq(dealsTable.id, id));
  res.status(204).send();
});

// GET /deals/:id/results — get calculated results
router.get("/:id/results", async (req, res) => {
  const { id } = GetDealResultsParams.parse({ id: Number(req.params.id) });
  const [deal] = await db.select().from(dealsTable).where(eq(dealsTable.id, id));
  if (!deal) return res.status(404).json({ error: "Deal not found" });

  const parsed = parseDeal(deal);
  const results = calculateDeal({
    purchasePrice: parsed.purchasePrice,
    estimatedRent: parsed.estimatedRent,
    taxes: parsed.taxes,
    insurance: parsed.insurance,
    hoa: parsed.hoa,
    maintenance: parsed.maintenance,
    propertyManagement: parsed.propertyManagement,
    utilities: parsed.utilities,
    downPayment: parsed.downPayment,
    interestRate: parsed.interestRate,
    loanTerm: parsed.loanTerm,
    rehabBudget: parsed.rehabBudget,
    closingCosts: parsed.closingCosts,
  });

  res.json({
    dealId: id,
    ...results,
  });
});

export default router;
