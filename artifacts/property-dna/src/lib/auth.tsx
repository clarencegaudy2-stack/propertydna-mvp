import { useUser, useClerk } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
  subscriptionStatus: string;
  role: "user" | "admin";
}

interface AuthContextValue {
  user: UserProfile | null;
  isLoaded: boolean;
  logout: () => void;
}

export function useAuth(): AuthContextValue {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();

  const { data: profile, isFetched: isProfileFetched } = useQuery({
    queryKey: ["me", clerkUser?.id],
    queryFn: async () => {
      const res = await fetch("/api/me", { credentials: "include" });
      if (!res.ok) return null;
      return res.json() as Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        isAdmin: boolean;
        subscriptionStatus: string;
      }>;
    },
    enabled: !!clerkUser,
    staleTime: 0,
  });

  // Only report fully loaded once BOTH Clerk is ready AND the profile query has settled.
  // This prevents the admin guard from firing before isAdmin is known.
  const fullyLoaded = isLoaded && (!clerkUser || isProfileFetched);

  if (!clerkUser || !isLoaded) {
    return { user: null, isLoaded: fullyLoaded, logout: () => signOut() };
  }

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    profile?.email ??
    "";
  const firstName =
    clerkUser.firstName ?? profile?.firstName ?? "";
  const lastName =
    clerkUser.lastName ?? profile?.lastName ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || email;

  const user: UserProfile = {
    id: clerkUser.id,
    name: fullName,
    email,
    firstName: firstName || null,
    lastName: lastName || null,
    isAdmin: profile?.isAdmin ?? false,
    subscriptionStatus: profile?.subscriptionStatus ?? "free",
    role: profile?.isAdmin ? "admin" : "user",
  };

  return {
    user,
    isLoaded: fullyLoaded,
    logout: () => signOut(),
  };
}
