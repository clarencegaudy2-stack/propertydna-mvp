---
name: Wouter + Clerk routing
description: How to handle Clerk OAuth sub-paths in Wouter v3.
---

## Problem
Clerk's `<SignIn routing="path">` creates sub-paths like `/sign-in/sso-callback`, `/sign-in/factor-one`, etc. for OAuth flows. Wouter's standard `<Route path="/sign-in">` does NOT match these sub-paths.

## Solution (Wouter v3)
Use optional wildcard suffix:
```tsx
<Route path="/sign-in/:rest*">
  <SignInPage />
</Route>
<Route path="/sign-up/:rest*">
  <SignUpPage />
</Route>
```
Or use the `/*?` optional wildcard: `/sign-in/*?` and `/sign-up/*?`

**Why:** Without this, Google/OAuth callbacks hit Wouter's 404 route instead of staying on the Clerk sign-in component, breaking OAuth login entirely.

**How to apply:** Any time Clerk routing="path" is used with Wouter, the parent route must capture sub-paths.
