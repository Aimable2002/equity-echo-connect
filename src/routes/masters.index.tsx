import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Avatar, PnL } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MASTERS, fmtMoney } from "@/lib/mock";

export const Route = createFileRoute("/masters/")({
  head: () => ({
    meta: [
      { title: "Masters directory — verified copy-trading strategies | CopyDesk" },
      {
        name: "description",
        content:
          "Browse every master available to copy with live net P&L, max drawdown, open exposure, win rate, follower count and trading platform.",
      },
      { property: "og:title", content: "Masters directory — verified strategies | CopyDesk" },
      {
        property: "og:description",
        content: "Compare verified master traders on P&L, drawdown, exposure and win rate.",
      },
    ],
  }),
  component: Directory,
});

function Directory() {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("all");
  const [sort, setSort] = useState("return30d");

  const list = useMemo(() => {
    return MASTERS.filter((m) => m.visible && m.approved)
      .filter((m) => (platform === "all" ? true : m.platform === platform))
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q.toLowerCase()) ||
          m.strategy.toLowerCase().includes(q.toLowerCase()),
      )
      .sort((a, b) => {
        if (sort === "drawdown") return a.maxDrawdown - b.maxDrawdown;
        if (sort === "followers") return b.followers - a.followers;
        if (sort === "pnl") return b.netPnl - a.netPnl;
        return b.return30d - a.return30d;
      });
  }, [q, platform, sort]);

  return (
    <AppShell title="Masters directory" subtitle={`${list.length} strategies accepting copiers`}>
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or strategy…"
            className="pl-9"
          />
        </div>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            <SelectItem value="MT5">MT5</SelectItem>
            <SelectItem value="cTrader">cTrader</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="return30d">Sort: 30-day return</SelectItem>
            <SelectItem value="pnl">Sort: net P&L</SelectItem>
            <SelectItem value="drawdown">Sort: lowest drawdown</SelectItem>
            <SelectItem value="followers">Sort: most followers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((m) => (
          <div key={m.id} className="panel flex flex-col p-5">
            <div className="flex items-start gap-3">
              <Avatar name={m.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">{m.name}</span>
                  {m.featured && <Badge className="text-[10px]">Featured</Badge>}
                </div>
                <div className="truncate text-xs text-muted-foreground">{m.strategy}</div>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px]">
                {m.platform}
              </Badge>
            </div>

            <div className="mt-4 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={m.equityCurve.slice(-45)}>
                  <defs>
                    <linearGradient id={`d-${m.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="var(--brand)" strokeWidth={1.6} fill={`url(#d-${m.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-y-3 border-t border-border pt-4 text-sm">
              <Row label="Net P&L" value={<PnL value={m.netPnl} digits={0} className="text-sm" />} />
              <Row label="Max drawdown" value={<span className="num text-warn">{m.maxDrawdown}%</span>} />
              <Row label="Open exposure" value={<span className="num">{m.openExposure} lots</span>} />
              <Row label="Win rate" value={<span className="num">{m.winRate}%</span>} />
              <Row label="Followers" value={<span className="num">{m.followers.toLocaleString()}</span>} />
              <Row label="AUM copied" value={<span className="num">{fmtMoney(m.aum)}</span>} />
            </dl>

            <Button asChild className="mt-5" variant="outline">
              <Link to="/masters/$masterId" params={{ masterId: m.id }}>
                View profile
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
