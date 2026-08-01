"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface UserData {
  name: string;
  email: string;
  skin_type: string;
  acne_severity: string;
  goal: string;
  plan: string;
  plan_expires_at: string | null;
}

interface UserContextValue {
  user: UserData;
  activePlan: "free" | "premium" | "pro";
  planActive: boolean;
  daysLeft: number;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<UserData>) => Promise<void>;
}

const defaultUser: UserData = {
  name: "",
  email: "",
  skin_type: "combination",
  acne_severity: "mild",
  goal: "clear_acne",
  plan: "free",
  plan_expires_at: null,
};

function computePlanState(user: UserData) {
  const paid = user.plan !== "free";
  const expires = user.plan_expires_at ? new Date(user.plan_expires_at).getTime() : null;
  const planActive = paid && (expires === null || expires > Date.now());
  const activePlan: "free" | "premium" | "pro" = !planActive
    ? "free"
    : user.plan.includes("pro")
      ? "pro"
      : "premium";
  const daysLeft = expires
    ? Math.max(0, Math.ceil((expires - Date.now()) / 86400000))
    : paid
      ? 0
      : 0;
  return { planActive, activePlan, daysLeft };
}

const UserContext = createContext<UserContextValue>({
  user: defaultUser,
  activePlan: "free",
  planActive: false,
  daysLeft: 0,
  loading: true,
  refreshUser: async () => {},
  updateUser: async () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData>(defaultUser);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (data.user) {
        const u = data.user;
        setUser({
          name: u.name || "User",
          email: u.email || "",
          skin_type: u.skin_type || "combination",
          acne_severity: u.acne_severity || "mild",
          goal: u.goal || "clear_acne",
          plan: u.plan || "free",
          plan_expires_at: u.plan_expires_at || null,
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (fetched) return;
    setFetched(true);
    refreshUser().finally(() => setLoading(false));
  }, [fetched, refreshUser]);

  const updateUser = useCallback(
    async (updates: Partial<UserData>) => {
      const next = { ...user, ...updates };
      setUser(next);
      try {
        await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      } catch {}
    },
    [user]
  );

  const planState = computePlanState(user);

  return (
    <UserContext.Provider value={{ user, ...planState, loading, refreshUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}
