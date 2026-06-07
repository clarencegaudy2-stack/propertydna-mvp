import { pgTable, serial, text, numeric, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dealStatusEnum = pgEnum("deal_status", ["NEW", "PAID", "IN_PROGRESS", "COMPLETED"]);

export const dealsTable = pgTable("deals", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).notNull(),
  estimatedRent: numeric("estimated_rent", { precision: 10, scale: 2 }).notNull(),
  taxes: numeric("taxes", { precision: 10, scale: 2 }).default("0"),
  insurance: numeric("insurance", { precision: 10, scale: 2 }).default("0"),
  hoa: numeric("hoa", { precision: 10, scale: 2 }).default("0"),
  maintenance: numeric("maintenance", { precision: 10, scale: 2 }).default("0"),
  propertyManagement: numeric("property_management", { precision: 10, scale: 2 }).default("0"),
  utilities: numeric("utilities", { precision: 10, scale: 2 }).default("0"),
  downPayment: numeric("down_payment", { precision: 12, scale: 2 }).notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 3 }).notNull(),
  loanTerm: integer("loan_term").notNull(),
  rehabBudget: numeric("rehab_budget", { precision: 12, scale: 2 }).default("0"),
  closingCosts: numeric("closing_costs", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  status: dealStatusEnum("status").notNull().default("NEW"),
  dealScore: numeric("deal_score", { precision: 5, scale: 2 }),
  dealRating: text("deal_rating"),
  recommendation: text("recommendation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDealSchema = createInsertSchema(dealsTable).omit({ id: true, createdAt: true });
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof dealsTable.$inferSelect;
