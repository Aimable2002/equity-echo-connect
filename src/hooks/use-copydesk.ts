import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import {
  supabase,
  fetchMyAccounts,
  fetchActivePackages,
  type AccountRow,
  type LiveAccountStateRow,
} from "@/lib/supabase";
import { endpoints, type DirectoryMaster } from "@/lib/api";

/* ------------------------------------------------------------ session */

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}

/** Redirects to /auth when there is no active session. */
export function useRequireAuth() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);
  return { session, loading };
}

/* ----------------------------------------------------------- accounts */

export function useMyAccounts() {
  const { session, loading } = useSession();
  return useQuery({
    queryKey: ["accounts", session?.user?.id ?? null],
    queryFn: fetchMyAccounts,
    enabled: !loading && !!session,
  });
}

const STORE_KEY = "copydesk.activeAccount";

/** The account currently in focus across app screens. */
export function useActiveAccount(filter?: (a: AccountRow) => boolean) {
  const { data: accounts = [], isLoading } = useMyAccounts();
  const pool = useMemo(
    () => (filter ? accounts.filter(filter) : accounts),
    [accounts, filter],
  );
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    if (!pool.length) return;
    const stored = typeof window === "undefined" ? null : window.localStorage.getItem(STORE_KEY);
    const valid = pool.find((a) => a.account_id === (id ?? stored));
    if (!valid) setId(pool[0]!.account_id);
    else if (!id) setId(valid.account_id);
  }, [pool, id]);

  const select = (next: string) => {
    setId(next);
    if (typeof window !== "undefined") window.localStorage.setItem(STORE_KEY, next);
  };

  return {
    accounts: pool,
    allAccounts: accounts,
    accountId: id,
    account: pool.find((a) => a.account_id === id) ?? null,
    select,
    isLoading,
  };
}

/* --------------------------------------------------- live account state */

export function useLiveAccountState(accountIds: string[]) {
  const key = accountIds.slice().sort().join(",");
  const [rows, setRows] = useState<Record<string, LiveAccountStateRow>>({});

  useEffect(() => {
    const ids = key ? key.split(",") : [];
    if (!ids.length) {
      setRows({});
      return;
    }
    let active = true;

    supabase
      .from("live_account_state")
      .select("*")
      .in("account_id", ids)
      .then(({ data }) => {
        if (!active || !data) return;
        const next: Record<string, LiveAccountStateRow> = {};
        for (const r of data as LiveAccountStateRow[]) next[r.account_id] = r;
        setRows(next);
      });

    const channel = supabase
      .channel(`live_state_${ids.join("_").slice(0, 60)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_account_state" },
        (payload) => {
          const row = payload.new as LiveAccountStateRow | null;
          if (!row?.account_id || !ids.includes(row.account_id)) return;
          setRows((prev) => ({ ...prev, [row.account_id]: row }));
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [key]);

  return rows;
}

/** now - updated_at, in ms (data freshness indicator). */
export function freshnessMs(updatedAt: string | null | undefined) {
  if (!updatedAt) return null;
  const t = new Date(updatedAt).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Date.now() - t);
}

/* ------------------------------------------------------------- shared */

export function useMastersDirectory() {
  return useQuery({
    queryKey: ["masters-directory"],
    queryFn: async (): Promise<DirectoryMaster[]> => {
      const res = await endpoints.mastersDirectory();
      return Array.isArray(res) ? res : (res?.masters ?? []);
    },
    staleTime: 60_000,
  });
}

export function useMasterTrades(accountId: string | null | undefined) {
  return useQuery({
    queryKey: ["master-trades", accountId],
    queryFn: () => endpoints.masterTrades(accountId!),
    enabled: !!accountId,
    staleTime: 60_000,
  });
}

export function useAccountTrades(accountId: string | null | undefined) {
  return useQuery({
    queryKey: ["account-trades", accountId],
    queryFn: () => endpoints.accountTrades(accountId!),
    enabled: !!accountId,
  });
}

export function usePackages() {
  return useQuery({ queryKey: ["packages"], queryFn: fetchActivePackages, staleTime: 300_000 });
}
