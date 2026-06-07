import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../middlewares/auth.js";

const router = Router();

// GET /me — return current user profile, JIT provision if first visit
router.get("/", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const auth = getAuth(req);

  let [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  if (!user) {
    const email = auth.sessionClaims?.email as string | undefined ?? "";
    const firstName = auth.sessionClaims?.firstName as string | undefined ?? null;
    const lastName = auth.sessionClaims?.lastName as string | undefined ?? null;
    [user] = await db
      .insert(usersTable)
      .values({ id: userId, email, firstName, lastName })
      .onConflictDoNothing()
      .returning();

    if (!user) {
      [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    }
  }

  res.json({
    id: user!.id,
    email: user!.email,
    firstName: user!.firstName,
    lastName: user!.lastName,
    isAdmin: user!.isAdmin,
    subscriptionStatus: user!.subscriptionStatus,
  });
});

export default router;
