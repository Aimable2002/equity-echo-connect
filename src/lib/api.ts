import { supabase } from "./supabase";

export const API_BASE_URL =
  import.meta.env['VITE_API_BASE_URL'] ?? "https://surviving-cork-lushness.ngrok-free.dev";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function detailToMessage(detail: unknown, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) => (d && typeof d === "object" && "msg" in d ? String((d as { msg: unknown }).msg) : null))
      .filter(Boolean);
    if (msgs.length) return msgs.join(", ");
  }
  return fallback;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Skip attaching the Supabase bearer token (public endpoints). */
  anonymous?: boolean;
  signal?: AbortSignal;
};

export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, anonymous = false, signal } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (!anonymous) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      ...(signal ? { signal } : {}),
    });
  } catch {
    throw new ApiError("Could not reach the CopyDesk service. Check your connection.", 0);
  }

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const detail =
      parsed && typeof parsed === "object" && "detail" in parsed
        ? (parsed as { detail: unknown }).detail
        : parsed;
    throw new ApiError(detailToMessage(detail, `Request failed (${res.status})`), res.status);
  }

  return parsed as T;
}

export const api = {
  get: <T = unknown>(path: string, opts: Omit<RequestOptions, "method" | "body"> = {}) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T = unknown>(path: string, body?: unknown, opts: Omit<RequestOptions, "method"> = {}) =>
    apiFetch<T>(path, { ...opts, method: "POST", body: body ?? {} }),
};

/* ------------------------------------------------------- shared shapes */

export type Deal = {
  deal_ticket: number | string;
  symbol: string;
  type: string;
  lots: number;
  entry: "in" | "out" | string;
  deal_time: string;
  pnl: number;
  price?: number;
  commission?: number;
  swap?: number;
  volume?: number;
};

export type DirectoryMaster = {
  account_id: string;
  display_name: string | null;
  bio: string | null;
  country: string | null;
  platform: string | null;
  broker: string | null;
};

export type MasterFollower = {
  follower_account_id: string;
  broker: string | null;
  platform: string | null;
  equity: number | null;
  sizing_mode: string | null;
  sizing_value: number | null;
  since: string | null;
  status: string | null;
};

export type ChallengeEnrollment = {
  id?: string;
  challenge_id: string;
  status: string;
  starting_equity: number;
  peak_equity: number;
  day_start_equity: number;
  day_start_date: string | null;
  breach_reason: string | null;
  enrolled_at: string;
};

export type ChallengeStatus = {
  phase: "challenger" | "graduated" | string;
  current_enrollment: ChallengeEnrollment | null;
  equity_curve: { snapshot_date: string; equity: number }[];
};

/* ------------------------------------------------------------ wrappers */

const tradesOf = (list: unknown): Deal[] => {
  if (Array.isArray(list)) return list as Deal[];
  if (list && typeof list === "object") {
    const obj = list as Record<string, unknown>;
    for (const key of ["trades", "deals", "items", "data"]) {
      if (Array.isArray(obj[key])) return obj[key] as Deal[];
    }
  }
  return [];
};

export const listAsArray = tradesOf;

export const endpoints = {
  mastersDirectory: () =>
    api.get<DirectoryMaster[] | { masters: DirectoryMaster[] }>("/masters/directory"),
  accountTrades: (accountId: string) =>
    api.get(`/accounts/${accountId}/trades`).then(tradesOf),
  masterTrades: (accountId: string) => api.get(`/masters/${accountId}/trades`).then(tradesOf),
  masterFollowers: (accountId: string) => api.get(`/masters/${accountId}/followers`),
  masterEarnings: (accountId: string) => api.get(`/masters/${accountId}/earnings`),
  masterPayouts: (accountId: string) => api.get(`/masters/${accountId}/payouts`),
  challengeStatus: (accountId: string) =>
    api.get<ChallengeStatus>(`/masters/${accountId}/challenges/status`),
  challengeHistory: (accountId: string) => api.get(`/masters/${accountId}/challenges/history`),
  wallet: (accountId: string) => api.get(`/accounts/${accountId}/wallet`),
  walletTransactions: (accountId: string) => api.get(`/accounts/${accountId}/wallet/transactions`),
  billing: (accountId: string) => api.get(`/accounts/${accountId}/billing`),
  currencies: () =>
    api.get<{ currencies: PaymentCurrency[] }>("/payments/currencies", { anonymous: true }),
  paymentStatus: (reference: string) => api.get(`/payments/${reference}`),
};

export type PaymentCurrency = {
  code: string;
  name: string;
  rate_per_usd: number | null;
  mobile_money: boolean;
  country: string;
};
