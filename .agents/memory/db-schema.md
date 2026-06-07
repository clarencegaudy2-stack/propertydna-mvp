---
name: DB schema decisions
description: Key schema choices for PropertyDNA — deals ownership, users table, subscriptions table.
---

## deals table
- `user_id` column is nullable TEXT (Clerk userId).
- Old seeded deals (id 1-5) have `user_id = null`.
- Deal routes use `or(eq(deals.userId, userId), isNull(deals.userId))` so seeded deals remain accessible to any authenticated user.

**Why:** Avoids breaking existing test data while enabling per-user isolation for new deals.

## users table
- Primary key is Clerk `userId` (TEXT, not auto-increment integer).
- Columns: `id`, `email`, `firstName`, `lastName`, `isAdmin` (bool, default false), `subscriptionStatus` (default "free"), `createdAt`, `updatedAt`.
- Provisioned JIT in `/api/me` on first login.

## subscriptions table
- Stripe-ready: `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd`.
- Not yet wired to Stripe — ready for Phase 2.

## Migration command
`pnpm --filter @workspace/db run push`
