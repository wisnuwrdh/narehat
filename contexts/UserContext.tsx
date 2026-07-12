"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface UserData {
  name: string;
  email: string;
  skin_type: string;
  acne_severity: string;
  goal: string;
  plan: string;
}

interface UserContextValue {
  user: UserData;
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
};

const UserContext = createContext<UserContextValue>({
  user: defaultUser,
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
          name: u.name || u.email?.split("@")[0] || "User",
          email: u.email || "",
          skin_type: u.skin_type || "combination",
          acne_severity: u.acne_severity || "mild",
          goal: u.goal || "clear_acne",
          plan: u.plan || "free",
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

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}
