import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Avatar, PnL, Stat } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MASTERS, fmtMoney, fmtTime, getMaster } from "@/lib/mock";

export const Route = createFileRoute("/masters/$masterId")({
  loader: ({ params }) => {
    const master = getMaster(params.masterId);
    if (!master) throw notFound();
    return { master };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Master not found — CopyDesk" }, { name: "robots", content: "noindex" }],
      };
    }
    const m = loaderData.master;
    const title = `${m.name} — copy-trading track record | CopyDesk`;
    const description = `${m.strategy}. ${m.return30d > 0 ? "+" : ""}${m.return30d}% over 30 days, ${m.maxDrawdown}% max drawdown, ${m.winRate}% win rate across ${m.closedTrades} verified trades on ${m.platform}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: MasterProfile,
});

function MasterProfile() {
  const { master: m } = Route.useLoaderData();

  return (
    <AppShell
      title={m.name}
      subtitle={`${m.handle} · ${m.broker} · ${m.platform}`}
      actions={
        <Button size="sm" onClick={() => toast.success(`Copy setup started for ${m.name}`)}>
          Copy this master
        </Button>
      }
    >
      <div className="panel p-6">
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={m.name} size={64} />
          <div className="min-w-64 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl font-bold">{m.name}</h2>
              {m.featured && <Badge>Featured</Badge>}
              <Badge variant="outline">{m.verifiedMonths} months verified</Badge>
              <Badge variant="outline">{m.country}</Badge>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{m.bio}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-4 text-sm">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Cost to copy</div>
            <div className="num mt-1 text-xl font-semibold">
              {m.feePct}% <span className="text-sm font-normal text-muted-foreground">performance fee</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {m.monthlyFee ? `+ $${m.monthlyFee}/mo subscription` : "No monthly subscription"}
            </div>
            <Button className="mt-4 w-full" onClick={() => toast.success("Copy setup started")}>
              Start copying
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="30-day return" value={<PnL value={m.return30d} prefix="" suffix="%" digits={1} className="text-2xl" />} />
        <Stat label="Net P&L (all time)" value={<PnL value={m.netPnl} digits={0} className="text-2xl" />} />
        <Stat label="Max drawdown" value={`${m.maxDrawdown}%`} hint={`Risk score ${m.riskScore}/10`} />
        <Stat label="Profit factor" value={m.profitFactor.toFixed(2)} accent hint={`${m.closedTrades} closed trades`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h3 className="font-display font-semibold">Equity growth</h3>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={m.equityCurve}>
                <defs>
                  <linearGradient id="mp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} minTickGap={50} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={60} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="v" stroke="var(--brand)" strokeWidth={2} fill="url(#mp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="font-display font-semibold">Risk profile</h3>
          <div className="mt-5 space-y-4">
            {[
              { l: "Max drawdown", v: m.maxDrawdown, max: 30, unit: "%" },
              { l: "Open exposure", v: m.openExposure, max: 12, unit: " lots" },
              { l: "Win rate", v: m.winRate, max: 100, unit: "%" },
              { l: "Risk score", v: m.riskScore, max: 10, unit: "/10" },
            ].map((r) => (
              <div key={r.l}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{r.l}</span>
                  <span className="num">
                    {r.v}
                    {r.unit}
                  </span>
                </div>
                <Progress value={(r.v / r.max) * 100} className="mt-2 h-1.5" />
              </div>
            ))}
          </div>
          <dl className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
            <KV k="Average win" v={<PnL value={m.avgWin} className="text-sm" />} />
            <KV k="Average loss" v={<PnL value={m.avgLoss} className="text-sm" />} />
            <KV k="Followers" v={<span className="num">{m.followers.toLocaleString()}</span>} />
            <KV k="Copied capital" v={<span className="num">{fmtMoney(m.aum)}</span>} />
            <KV k="Track record" v={<span className="num">{m.verifiedMonths} months</span>} />
          </dl>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="panel p-5">
          <h3 className="font-display font-semibold">Performance by symbol</h3>
          <div className="mt-5 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.bySymbol}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="symbol" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={56} />
                <Tooltip contentStyle={tt} cursor={{ fill: "var(--accent)" }} />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                  {m.bySymbol.map((s) => (
                    <Cell key={s.symbol} fill={s.pnl >= 0 ? "var(--long)" : "var(--short)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="font-display font-semibold">Trading activity by hour (UTC)</h3>
          <div className="mt-5 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.byHour}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={tt} cursor={{ fill: "var(--accent)" }} />
                <Bar dataKey="trades" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel mt-6 overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <h3 className="font-display font-semibold">Recent completed trades</h3>
          <Link to="/trades" className="text-xs text-primary hover:underline">
            Full history →
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="text-right">Lots</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Closed</TableHead>
              <TableHead className="text-right">Pips</TableHead>
              <TableHead className="text-right">P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {m.recentTrades.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="num font-medium">{t.symbol}</TableCell>
                <TableCell>
                  <span className={t.side === "BUY" ? "text-long" : "text-short"}>{t.side}</span>
                </TableCell>
                <TableCell className="num text-right">{t.lots.toFixed(2)}</TableCell>
                <TableCell className="num text-xs text-muted-foreground">{fmtTime(t.open)}</TableCell>
                <TableCell className="num text-xs text-muted-foreground">{t.close ? fmtTime(t.close) : "—"}</TableCell>
                <TableCell className="num text-right">{t.pips}</TableCell>
                <TableCell className="text-right">
                  <PnL value={t.pnl} className="text-sm" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6">
        <h3 className="font-display font-semibold">Similar masters</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {MASTERS.filter((x) => x.id !== m.id && x.platform === m.platform)
            .slice(0, 3)
            .map((x) => (
              <Link
                key={x.id}
                to="/masters/$masterId"
                params={{ masterId: x.id }}
                className="panel flex items-center gap-3 p-4 transition-colors hover:border-primary/50"
              >
                <Avatar name={x.name} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{x.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{x.strategy}</div>
                </div>
                <PnL value={x.return30d} prefix="" suffix="%" digits={1} className="text-xs" />
              </Link>
            ))}
        </div>
      </div>
    </AppShell>
  );
}

const tt = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
