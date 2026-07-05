"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { user, loading };
}
