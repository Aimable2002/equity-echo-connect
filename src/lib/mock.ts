/**
 * CopyDesk mock data layer.
 * Deterministic pseudo-random generation so every screen is internally
 * consistent between renders and between server/client (no hydration drift).
 */

export type Platform = "MT5" | "cTrader";

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const SYMBOLS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "XAUUSD",
  "AUDUSD",
  "USDCAD",
  "GBPJPY",
  "US30",
  "NAS100",
  "BTCUSD",
];

export const BROKERS = [
  { name: "IC Markets", platform: "MT5" as Platform, servers: ["ICMarkets-Live12", "ICMarkets-Live24"] },
  { name: "Pepperstone", platform: "MT5" as Platform, servers: ["Pepperstone-Live05"] },
  { name: "Exness", platform: "MT5" as Platform, servers: ["Exness-Real18", "Exness-Real33"] },
  { name: "FXPesa", platform: "MT5" as Platform, servers: ["FXPesa-Live02"] },
  { name: "Vantage", platform: "MT5" as Platform, servers: ["Vantage-Live9"] },
  { name: "Axi", platform: "cTrader" as Platform, servers: ["Axi-cTrader-Live"] },
  { name: "FxPro", platform: "cTrader" as Platform, servers: ["FxPro-cTrader-Live1"] },
];

export type Master = {
  id: string;
  name: string;
  handle: string;
  avatarSeed: string;
  country: string;
  platform: Platform;
  broker: string;
  strategy: string;
  bio: string;
  featured: boolean;
  visible: boolean;
  approved: boolean;
  verifiedMonths: number;
  followers: number;
  aum: number;
  return30d: number;
  return90d: number;
  returnAll: number;
  netPnl: number;
  maxDrawdown: number;
  openExposure: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  closedTrades: number;
  riskScore: number;
  feePct: number;
  monthlyFee: number;
  equityCurve: { t: string; v: number }[];
  bySymbol: { symbol: string; pnl: number; trades: number; winRate: number }[];
  byHour: { hour: string; trades: number; pnl: number }[];
  recentTrades: Trade[];
};

export type Trade = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  lots: number;
  open: string;
  close: string | null;
  openPrice: number;
  closePrice: number | null;
  pnl: number;
  pips: number;
  status: "OPEN" | "CLOSED";
};

const NAMES = [
  ["Amara Okonkwo", "NG", "London breakout on majors"],
  ["Diego Fontana", "IT", "Mean reversion, gold focus"],
  ["Yuki Tanaka", "JP", "Asian session scalper"],
  ["Sofia Marchetti", "CH", "Swing macro, low frequency"],
  ["Kwame Mensah", "GH", "Smart-money concepts, indices"],
  ["Elena Petrova", "BG", "Grid-free trend continuation"],
  ["Marcus Whitfield", "GB", "News-fade on USD pairs"],
  ["Priya Nair", "IN", "Volatility breakout, NAS100"],
  ["Tomas Berg", "SE", "Carry + momentum blend"],
  ["Layla Haddad", "AE", "Gold session momentum"],
  ["Nathan Cole", "US", "Order-flow intraday"],
  ["Zanele Dube", "ZA", "Range reversion on crosses"],
] as const;

function makeEquityCurve(rnd: () => number, months: number, drift: number) {
  const pts: { t: string; v: number }[] = [];
  let v = 10000;
  const start = new Date(Date.UTC(2026, 7, 16));
  const days = Math.min(months * 21, 260);
  for (let i = days; i >= 0; i--) {
    const d = new Date(start.getTime() - i * 86400000);
    v = v * (1 + drift / 100 / 21 + (rnd() - 0.48) * 0.011);
    pts.push({ t: d.toISOString().slice(0, 10), v: Math.round(v) });
  }
  return pts;
}

function makeTrades(rnd: () => number, n: number, winRate: number, seedId: string): Trade[] {
  const out: Trade[] = [];
  const now = Date.UTC(2026, 7, 16, 15, 30);
  for (let i = 0; i < n; i++) {
    const symbol = SYMBOLS[Math.floor(rnd() * SYMBOLS.length)]!;
    const win = rnd() * 100 < winRate;
    const openTs = now - (i * 3600000 * (2 + rnd() * 9) + rnd() * 3600000);
    const dur = (10 + rnd() * 600) * 60000;
    const pips = Math.round((win ? 8 + rnd() * 90 : -(6 + rnd() * 55)) * 10) / 10;
    const base = symbol === "XAUUSD" ? 3320 : symbol === "BTCUSD" ? 88400 : symbol === "USDJPY" ? 152.4 : symbol.startsWith("US") || symbol.startsWith("NAS") ? 20140 : 1.0865;
    const openPrice = Math.round(base * (1 + (rnd() - 0.5) * 0.01) * 100000) / 100000;
    const lots = Math.round((0.2 + rnd() * 2.4) * 100) / 100;
    out.push({
      id: `${seedId}-T${1000 + i}`,
      symbol,
      side: rnd() > 0.5 ? "BUY" : "SELL",
      lots,
      open: new Date(openTs).toISOString(),
      close: new Date(openTs + dur).toISOString(),
      openPrice,
      closePrice: Math.round(openPrice * (1 + (win ? 1 : -1) * rnd() * 0.004) * 100000) / 100000,
      pnl: Math.round(pips * lots * 9.4 * 100) / 100,
      pips,
      status: "CLOSED",
    });
  }
  return out;
}

export const MASTERS: Master[] = NAMES.map(([name, country, strategy], i) => {
  const rnd = mulberry(hash(name) + 7);
  const id = name.toLowerCase().split(" ")[0]! + "-" + (i + 1);
  const platform: Platform = i % 4 === 3 ? "cTrader" : "MT5";
  const brokerPool = BROKERS.filter((b) => b.platform === platform);
  const winRate = Math.round((48 + rnd() * 28) * 10) / 10;
  const months = 6 + Math.floor(rnd() * 30);
  const return30d = Math.round((rnd() * 26 - 4) * 10) / 10;
  const maxDrawdown = Math.round((4 + rnd() * 19) * 10) / 10;
  const avgWin = Math.round((120 + rnd() * 480) * 100) / 100;
  const avgLoss = Math.round((-(80 + rnd() * 240)) * 100) / 100;
  const closedTrades = 180 + Math.floor(rnd() * 1400);
  const profitFactor = Math.round((1.05 + rnd() * 1.5) * 100) / 100;
  const trades = makeTrades(rnd, 14, winRate, id);
  return {
    id,
    name,
    handle: "@" + name.toLowerCase().replace(/[^a-z]/g, ""),
    avatarSeed: name,
    country,
    platform,
    broker: brokerPool[Math.floor(rnd() * brokerPool.length)]!.name,
    strategy,
    bio: `${strategy}. Trading live capital since ${2026 - Math.ceil(months / 12)}. Fixed risk per position, no martingale, no grid. Every fill is published to CopyDesk within milliseconds of execution.`,
    featured: i < 3,
    visible: i !== 11,
    approved: i !== 10,
    verifiedMonths: months,
    followers: 40 + Math.floor(rnd() * 2400),
    aum: Math.round((80000 + rnd() * 5200000) / 1000) * 1000,
    return30d,
    return90d: Math.round((return30d * (1.6 + rnd())) * 10) / 10,
    returnAll: Math.round((return30d * (3 + rnd() * 6)) * 10) / 10,
    netPnl: Math.round((5000 + rnd() * 420000) / 10) * 10,
    maxDrawdown,
    openExposure: Math.round((0.4 + rnd() * 9) * 100) / 100,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    closedTrades,
    riskScore: Math.min(10, Math.max(1, Math.round(maxDrawdown / 2.4))),
    feePct: [15, 20, 25, 30][Math.floor(rnd() * 4)]!,
    monthlyFee: [0, 19, 29, 49][Math.floor(rnd() * 4)]!,
    equityCurve: makeEquityCurve(rnd, months, return30d),
    bySymbol: SYMBOLS.slice(0, 6).map((symbol) => ({
      symbol,
      pnl: Math.round((rnd() * 90000 - 18000) / 10) * 10,
      trades: 12 + Math.floor(rnd() * 220),
      winRate: Math.round((40 + rnd() * 40) * 10) / 10,
    })),
    byHour: Array.from({ length: 12 }, (_, h) => ({
      hour: `${String(h * 2).padStart(2, "0")}:00`,
      trades: Math.floor(rnd() * 90),
      pnl: Math.round((rnd() * 16000 - 4000) / 10) * 10,
    })),
    recentTrades: trades,
  };
});

export function getMaster(id: string) {
  return MASTERS.find((m) => m.id === id);
}

export const PLATFORM_STATS = {
  latencyMs: 38,
  openSignalPnl: 128_940,
  masters: MASTERS.length + 176,
  liveAccounts: 9_412,
  copiedToday: 24_318,
  uptime: 99.98,
};

export type Account = {
  id: string;
  label: string;
  role: "master" | "follower";
  platform: Platform;
  broker: string;
  server: string;
  login: string;
  currency: string;
  balance: number;
  equity: number;
  openPnl: number;
  status: "live" | "paused" | "closed";
  copying?: string;
  sizingMode?: "proportional" | "fixed-lot" | "risk-percent" | "micro-scale";
  sizingValue?: number;
  createdAt: string;
};

export const ACCOUNTS: Account[] = [
  {
    id: "acc-1",
    label: "Primary Follower — IC Markets",
    role: "follower",
    platform: "MT5",
    broker: "IC Markets",
    server: "ICMarkets-Live12",
    login: "51840223",
    currency: "USD",
    balance: 4820.55,
    equity: 5013.9,
    openPnl: 193.35,
    status: "live",
    copying: MASTERS[0]!.id,
    sizingMode: "risk-percent",
    sizingValue: 0.75,
    createdAt: "2026-03-04",
  },
  {
    id: "acc-2",
    label: "Micro Test — Exness",
    role: "follower",
    platform: "MT5",
    broker: "Exness",
    server: "Exness-Real18",
    login: "10428871",
    currency: "USD",
    balance: 214.2,
    equity: 208.66,
    openPnl: -5.54,
    status: "live",
    copying: MASTERS[4]!.id,
    sizingMode: "micro-scale",
    sizingValue: 0.01,
    createdAt: "2026-06-21",
  },
  {
    id: "acc-3",
    label: "Signal Desk — Pepperstone",
    role: "master",
    platform: "MT5",
    broker: "Pepperstone",
    server: "Pepperstone-Live05",
    login: "77390112",
    currency: "USD",
    balance: 62140.0,
    equity: 63912.4,
    openPnl: 1772.4,
    status: "live",
    createdAt: "2025-11-12",
  },
  {
    id: "acc-4",
    label: "Legacy Follower — Vantage",
    role: "follower",
    platform: "MT5",
    broker: "Vantage",
    server: "Vantage-Live9",
    login: "60021455",
    currency: "USD",
    balance: 0,
    equity: 0,
    openPnl: 0,
    status: "closed",
    copying: MASTERS[2]!.id,
    sizingMode: "proportional",
    sizingValue: 1,
    createdAt: "2025-08-02",
  },
];

export function getAccount(id: string) {
  return ACCOUNTS.find((a) => a.id === id);
}

export const OPEN_POSITIONS = [
  { id: "P-9001", symbol: "XAUUSD", side: "BUY" as const, lots: 0.42, entry: 3318.44, current: 3327.9, pnl: 397.32, master: MASTERS[0]!.name, opened: "12m ago" },
  { id: "P-9002", symbol: "EURUSD", side: "SELL" as const, lots: 1.1, entry: 1.0872, current: 1.0864, pnl: 88.0, master: MASTERS[0]!.name, opened: "48m ago" },
  { id: "P-9003", symbol: "NAS100", side: "BUY" as const, lots: 0.3, entry: 20118.5, current: 20090.2, pnl: -84.9, master: MASTERS[4]!.name, opened: "1h 22m ago" },
  { id: "P-9004", symbol: "GBPJPY", side: "BUY" as const, lots: 0.25, entry: 197.42, current: 197.81, pnl: 64.1, master: MASTERS[4]!.name, opened: "3h 05m ago" },
];

export const EQUITY_SUMMARY = Array.from({ length: 30 }, (_, i) => {
  const rnd = mulberry(1000 + i);
  return {
    t: new Date(Date.UTC(2026, 6, 18) + i * 86400000).toISOString().slice(0, 10),
    equity: Math.round(58000 + i * 380 + (rnd() - 0.5) * 2600),
    balance: Math.round(57200 + i * 350),
  };
});

export const PAYOUTS = [
  { id: "PO-2291", period: "Jul 2026", amount: 4820.4, requested: "2026-08-02", status: "paid" as const, method: "Bank transfer • ****4471" },
  { id: "PO-2244", period: "Jun 2026", amount: 3915.1, requested: "2026-07-02", status: "paid" as const, method: "Bank transfer • ****4471" },
  { id: "PO-2378", period: "Aug 2026 (partial)", amount: 2140.0, requested: "2026-08-14", status: "pending" as const, method: "Mobile money • ****0912" },
  { id: "PO-2102", period: "May 2026", amount: 1188.75, requested: "2026-06-03", status: "rejected" as const, method: "Bank transfer • ****4471" },
];

export const EARNINGS = Array.from({ length: 8 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][i]!,
  fees: Math.round(900 + mulberry(30 + i)() * 5200),
}));

export const WALLET = {
  balance: 342.18,
  currency: "USD",
  localCurrency: "KES",
  fxRate: 129.4,
  plan: "Pro",
  planPrice: 49,
  renews: "2026-09-01",
  status: "active" as "active" | "cancelled",
};

export const TRANSACTIONS = [
  { id: "TX-88214", date: "2026-08-14", desc: "Subscription — Pro (monthly)", amount: -49, method: "Card ****4242", status: "completed" as const },
  { id: "TX-88190", date: "2026-08-11", desc: "Wallet top-up", amount: 200, method: "M-Pesa ****0912", status: "completed" as const },
  { id: "TX-88101", date: "2026-08-04", desc: "Performance fee — Amara Okonkwo", amount: -84.2, method: "Wallet", status: "completed" as const },
  { id: "TX-87994", date: "2026-07-28", desc: "Wallet top-up", amount: 150, method: "Bank transfer", status: "pending" as const },
  { id: "TX-87880", date: "2026-07-14", desc: "Subscription — Pro (monthly)", amount: -49, method: "Card ****4242", status: "completed" as const },
  { id: "TX-87712", date: "2026-07-02", desc: "Challenge entry — Velocity 25K", amount: -129, method: "Card ****4242", status: "failed" as const },
];

export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    tagline: "Mirror one master, no card required",
    features: ["1 follower account", "1 master subscription", "Micro-scaling down to 0.01 lots", "Standard 250ms relay", "Email trade alerts"],
    cta: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    tagline: "For serious followers running multiple books",
    features: ["5 follower accounts", "Unlimited master subscriptions", "Priority <40ms relay", "Risk-normalised sizing engine", "Drawdown circuit breaker", "Full trade analytics export"],
    highlight: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "desk",
    name: "Desk",
    price: 149,
    tagline: "For master traders and small funds",
    features: ["Unlimited accounts", "Publish as a master", "Performance-fee billing & payouts", "Public master profile + directory listing", "Dedicated relay node", "Priority support"],
    cta: "Go Desk",
  },
];

export const CHALLENGES = [
  {
    id: "velocity-25k",
    name: "Velocity 25K",
    fee: 129,
    accountSize: 25000,
    profitTarget: 8,
    maxDailyLoss: 4,
    maxDrawdown: 8,
    minDays: 5,
    reward: "Copy fee waived for 6 months + featured directory slot",
    active: true,
  },
  {
    id: "momentum-50k",
    name: "Momentum 50K",
    fee: 249,
    accountSize: 50000,
    profitTarget: 10,
    maxDailyLoss: 5,
    maxDrawdown: 10,
    minDays: 10,
    reward: "Master status fast-track + $500 wallet credit",
    active: true,
  },
  {
    id: "apex-100k",
    name: "Apex 100K",
    fee: 449,
    accountSize: 100000,
    profitTarget: 12,
    maxDailyLoss: 5,
    maxDrawdown: 12,
    minDays: 15,
    reward: "Funded master seat + 80% fee split",
    active: true,
  },
];

export const ACTIVE_CHALLENGE = {
  id: "velocity-25k",
  name: "Velocity 25K",
  startedAt: "2026-08-04",
  day: 12,
  accountSize: 25000,
  equity: 26612.4,
  profitPct: 6.45,
  profitTarget: 8,
  dailyLossPct: 1.2,
  maxDailyLoss: 4,
  drawdownPct: 3.1,
  maxDrawdown: 8,
  tradingDays: 9,
  minDays: 5,
  curve: Array.from({ length: 12 }, (_, i) => ({
    day: `D${i + 1}`,
    equity: Math.round(25000 + i * 140 + mulberry(500 + i)() * 900),
  })),
};

export const CHALLENGE_HISTORY = [
  { id: "CH-1180", program: "Momentum 50K", started: "2026-05-02", ended: "2026-05-27", result: "passed" as const, finalPct: 11.4 },
  { id: "CH-1044", program: "Velocity 25K", started: "2026-03-11", ended: "2026-03-19", result: "failed" as const, finalPct: -8.6 },
  { id: "CH-0975", program: "Velocity 25K", started: "2026-01-20", ended: "2026-02-14", result: "passed" as const, finalPct: 9.2 },
  { id: "CH-1201", program: "Apex 100K", started: "2026-06-08", ended: "2026-06-10", result: "breached" as const, finalPct: -5.3 },
];

export const ADMIN_KPIS = [
  { label: "Live accounts", value: "9,412", delta: "+3.8%" },
  { label: "Monthly recurring revenue", value: "$182,940", delta: "+6.1%" },
  { label: "Copied trades (24h)", value: "24,318", delta: "+11.2%" },
  { label: "Avg relay latency", value: "38 ms", delta: "-4 ms" },
  { label: "Pending payouts", value: "$18,340", delta: "7 requests" },
  { label: "Failed copies (24h)", value: "0.14%", delta: "-0.03pp" },
];

export const ADMIN_PAYOUTS = [
  { id: "PO-2378", master: "Amara Okonkwo", amount: 2140.0, requested: "2026-08-14", method: "Mobile money", status: "pending" as const },
  { id: "PO-2381", master: "Kwame Mensah", amount: 5620.5, requested: "2026-08-15", method: "Bank transfer", status: "pending" as const },
  { id: "PO-2384", master: "Yuki Tanaka", amount: 990.25, requested: "2026-08-15", method: "Bank transfer", status: "pending" as const },
  { id: "PO-2386", master: "Elena Petrova", amount: 3410.0, requested: "2026-08-16", method: "Crypto (USDT)", status: "pending" as const },
];

export const ADMIN_USERS = [
  { id: "U-4471", email: "amara@copydesk.io", role: "master", accounts: 2, joined: "2025-04-11", status: "active" as const },
  { id: "U-5520", email: "trader.jm@gmail.com", role: "follower", accounts: 3, joined: "2026-01-22", status: "active" as const },
  { id: "U-5601", email: "kwame.m@outlook.com", role: "master", accounts: 1, joined: "2025-09-30", status: "active" as const },
  { id: "U-5902", email: "spam.copy@mail.ru", role: "follower", accounts: 8, joined: "2026-08-09", status: "suspended" as const },
  { id: "U-6011", email: "layla.h@proton.me", role: "master", accounts: 2, joined: "2026-02-14", status: "pending" as const },
];

export const SPEND_HISTORY = [
  { id: "SP-771", date: "2026-08-14", master: "Amara Okonkwo", type: "Performance fee", amount: 84.2 },
  { id: "SP-742", date: "2026-08-01", master: "Amara Okonkwo", type: "Monthly copy fee", amount: 29 },
  { id: "SP-720", date: "2026-07-14", master: "Kwame Mensah", type: "Performance fee", amount: 41.6 },
  { id: "SP-701", date: "2026-07-01", master: "Kwame Mensah", type: "Monthly copy fee", amount: 19 },
];

export const COPIERS = [
  { id: "F-2201", account: "MT5 • 51840223", broker: "IC Markets", equity: 5013.9, sizing: "0.75% risk", since: "2026-03-04", status: "live" as const },
  { id: "F-2288", account: "MT5 • 90417732", broker: "Exness", equity: 1240.0, sizing: "Micro 0.01", since: "2026-05-19", status: "live" as const },
  { id: "F-2310", account: "cTrader • 41200", broker: "FxPro", equity: 24800.5, sizing: "Proportional 1.0x", since: "2026-06-02", status: "paused" as const },
];

export function allTrades(seed = "history"): Trade[] {
  const rnd = mulberry(hash(seed));
  const closed = makeTrades(rnd, 60, 61, "H");
  return closed;
}

export const fmtMoney = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: Math.abs(n) >= 1000 ? 0 : 2,
  }).format(n);

export const fmtNum = (n: number, d = 2) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);

export const fmtPct = (n: number, d = 1) => `${n > 0 ? "+" : ""}${n.toFixed(d)}%`;

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
