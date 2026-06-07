import { Router } from "express";
import { clerkClient } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../middlewares/auth.js";

const router = Router();

// GET /me — return current user profile, JIT provision if first visit
router.get("/", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  let [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  if (!user) {
    const clerkUser = await clerkClient.users.getUser(userId);
    const email =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      "";
    const firstName = clerkUser.firstName ?? null;
    const lastName = clerkUser.lastName ?? null;

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
