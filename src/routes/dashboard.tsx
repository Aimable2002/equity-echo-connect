import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowUpRight } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { PnL, Stat, StatusDot } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ACCOUNTS,
  EQUITY_SUMMARY,
  OPEN_POSITIONS,
  getMaster,
  fmtMoney,
} from "@/lib/mock";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — your copy-trading accounts | CopyDesk" },
      {
        name: "description",
        content:
          "Live balance, equity and status for every master and follower account you own, plus combined performance and open mirrored positions.",
      },
      { property: "og:title", content: "Dashboard — your copy-trading accounts | CopyDesk" },
      {
        property: "og:description",
        content: "Track equity, open exposure and mirrored fills across all connected accounts.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const live = ACCOUNTS.filter((a) => a.status !== "closed");
  const equity = live.reduce((s, a) => s + a.equity, 0);
  const balance = live.reduce((s, a) => s + a.balance, 0);
  const open = live.reduce((s, a) => s + a.openPnl, 0);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Sunday 16 Aug 2026 · markets open in 6h 30m"
      actions={
        <Button size="sm" asChild>
          <Link to="/onboarding">
            <Plus className="mr-1 h-4 w-4" /> Add account
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Combined equity" value={fmtMoney(equity)} hint={`${live.length} live accounts`} />
        <Stat label="Combined balance" value={fmtMoney(balance)} />
        <Stat
          label="Open P&L"
          value={<PnL value={open} className="text-2xl" />}
          hint={`${OPEN_POSITIONS.length} mirrored positions`}
        />
        <Stat label="30-day return" value="+11.4%" accent hint="Weighted across accounts" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Combined equity curve</h2>
            <Badge variant="outline" className="text-[10px]">Last 30 days</Badge>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EQUITY_SUMMARY}>
                <defs>
                  <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} minTickGap={40} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={54} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="equity" stroke="var(--brand)" strokeWidth={2} fill="url(#eq)" />
                <Line type="monotone" dataKey="balance" stroke="var(--muted-foreground)" strokeWidth={1} dot={false} strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="font-display font-semibold">Open mirrored positions</h2>
          <div className="mt-4 space-y-3">
            {OPEN_POSITIONS.map((p) => (
              <div key={p.id} className="rounded-md border border-border bg-surface-2 p-3">
                <div className="flex items-center justify-between">
                  <span className="num text-sm font-medium">{p.symbol}</span>
                  <Badge
                    variant="outline"
                    className={p.side === "BUY" ? "border-long/40 text-long" : "border-short/40 text-short"}
                  >
                    {p.side} {p.lots}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="num">
                    {p.entry} → {p.current}
                  </span>
                  <PnL value={p.pnl} className="text-xs" />
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {p.master} · {p.opened}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold">Your accounts</h2>
          <Link to="/trades" className="text-xs text-primary hover:underline">
            View trade history →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {ACCOUNTS.map((a) => {
            const m = a.copying ? getMaster(a.copying) : null;
            return (
              <Link
                key={a.id}
                to="/accounts/$accountId"
                params={{ accountId: a.id }}
                className="panel block p-5 transition-colors hover:border-primary/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{a.label}</span>
                      <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                        {a.role}
                      </Badge>
                    </div>
                    <div className="num mt-1 text-xs text-muted-foreground">
                      {a.platform} · {a.broker} · #{a.login}
                    </div>
                  </div>
                  <StatusDot status={a.status} />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance</div>
                    <div className="num text-sm font-medium">{fmtMoney(a.balance)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Equity</div>
                    <div className="num text-sm font-medium">{fmtMoney(a.equity)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Open P&L</div>
                    <PnL value={a.openPnl} className="text-sm" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>
                    {m ? `Copying ${m.name} · ${a.sizingMode}` : "Publishing signals"}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}

          <Link
            to="/onboarding"
            className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="mr-2 h-4 w-4" /> Connect another MT5 or cTrader account
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
