---
name: Clerk auth architecture
description: How Clerk is integrated into the PropertyDNA frontend and API, and the useAuth() compatibility wrapper.
---

## Setup
- Clerk is Replit-managed (provisioned via `setupClerkWhitelabelAuth()`).
- Keys: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` (all set in Replit secrets).
- Dev keys have `pk_test_` prefix — this is expected and not a bug.
- "Development mode" banner and console warning about dev keys are normal in local dev.

## Frontend
- `ClerkProvider` wraps the entire app in `App.tsx` with `publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}`.
- `<SignIn>` and `<SignUp>` are rendered at `/sign-in` and `/sign-up` with `routing="path"`.
- `ProtectedRoute` uses Clerk's `<SignedIn>/<SignedOut>` to guard routes — individual page auth guards removed.
- `useAuth()` in `lib/auth.tsx` wraps Clerk's `useUser()` + fetches `/api/me` for DB-stored role/admin data. Returns `{ user, isLoaded, logout }` — backward-compatible shape.
- `user` shape: `{ id, name, email, firstName, lastName, isAdmin, role, subscriptionStatus }`.
- Profile editing is read-only on the Settings page — profile changes go through Clerk's account portal.

## API server
- `clerkMiddleware()` wired globally in `app.ts` via http-proxy-middleware (Clerk's Express SDK).
- `requireAuth` middleware extracts `userId` from `req.auth.userId`.
- `/api/me` is a JIT provisioning route: creates a `users` row on first login if it doesn't exist.
- Admin routes check `users.isAdmin` in the local DB — no Clerk metadata needed.

## Known race condition (fixed)
`isLoaded` from Clerk's `useUser()` fires before the `/api/me` profile query resolves. Without the fix, admin guards fire too early with `isAdmin: false`. Fix: `useAuth()` returns `isLoaded = clerkIsLoaded && (!clerkUser || isProfileFetched)` — only true once BOTH Clerk and the profile query have settled.

## JIT provisioning email (fixed)
`auth.sessionClaims?.email` returns empty string in Clerk dev/test environment. Fix: use `clerkClient.users.getUser(userId)` in `/api/me` to get the real email and name from Clerk's API.

## staleTime
`/api/me` query uses `staleTime: 0` so every page load refetches the profile. This ensures role changes (is_admin promotion) take effect on next page reload without requiring re-login.

## CSS (Tailwind v4)
- Layer declaration must come BEFORE `@import "tailwindcss"`:
  ```css
  @layer theme, base, clerk, components, utilities;
  @import "tailwindcss";
  @import "@clerk/themes/shadcn.css";
  ```

**Why:** Tailwind v4 processes layers in declaration order; without explicit declaration, Clerk's styles conflict with Tailwind's base/utilities layers.
