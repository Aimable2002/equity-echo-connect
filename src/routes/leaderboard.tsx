import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpDown, Crown } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Avatar, PnL } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MASTERS, type Master, fmtMoney } from "@/lib/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Master leaderboard — ranked trading performance | CopyDesk" },
      {
        name: "description",
        content:
          "Rank verified masters by 30-day return, net P&L, max drawdown, profit factor, return-to-drawdown, average win and loss, win rate and track record length.",
      },
      { property: "og:title", content: "Master leaderboard — ranked performance | CopyDesk" },
      {
        property: "og:description",
        content: "Compare every CopyDesk master across eleven verified performance metrics.",
      },
    ],
  }),
  component: Leaderboard,
});

type Col = {
  key: string;
  label: string;
  get: (m: Master) => number;
  render: (m: Master) => React.ReactNode;
  desc?: boolean;
};

const rtd = (m: Master) => m.return30d / Math.max(m.maxDrawdown, 0.1);

const COLS: Col[] = [
  { key: "return30d", label: "30d return", get: (m) => m.return30d, render: (m) => <PnL value={m.return30d} prefix="" suffix="%" digits={1} className="text-sm" /> },
  { key: "netPnl", label: "Net P&L", get: (m) => m.netPnl, render: (m) => <PnL value={m.netPnl} digits={0} className="text-sm" /> },
  { key: "maxDrawdown", label: "Max DD", get: (m) => m.maxDrawdown, render: (m) => <span className="num text-warn">{m.maxDrawdown}%</span> },
  { key: "profitFactor", label: "Profit factor", get: (m) => m.profitFactor, render: (m) => <span className="num">{m.profitFactor.toFixed(2)}</span> },
  { key: "rtd", label: "Return / DD", get: rtd, render: (m) => <span className="num text-primary">{rtd(m).toFixed(2)}</span> },
  { key: "avgWin", label: "Avg win", get: (m) => m.avgWin, render: (m) => <span className="num text-long">{fmtMoney(m.avgWin)}</span> },
  { key: "avgLoss", label: "Avg loss", get: (m) => m.avgLoss, render: (m) => <span className="num text-short">{fmtMoney(m.avgLoss)}</span> },
  { key: "winRate", label: "Win rate", get: (m) => m.winRate, render: (m) => <span className="num">{m.winRate}%</span> },
  { key: "closedTrades", label: "Trades", get: (m) => m.closedTrades, render: (m) => <span className="num">{m.closedTrades.toLocaleString()}</span> },
  { key: "verifiedMonths", label: "Track record", get: (m) => m.verifiedMonths, render: (m) => <span className="num">{m.verifiedMonths}mo</span> },
  { key: "followers", label: "Followers", get: (m) => m.followers, render: (m) => <span className="num">{m.followers.toLocaleString()}</span> },
];

function Leaderboard() {
  const [sortKey, setSortKey] = useState("return30d");
  const [asc, setAsc] = useState(false);

  const rows = useMemo(() => {
    const col = COLS.find((c) => c.key === sortKey) ?? COLS[0]!;
    return [...MASTERS]
      .filter((m) => m.visible && m.approved)
      .sort((a, b) => (asc ? col.get(a) - col.get(b) : col.get(b) - col.get(a)));
  }, [sortKey, asc]);

  const podium = rows.slice(0, 3);

  return (
    <AppShell title="Leaderboard" subtitle="Rolling 30-day window · updated every 60 seconds">
      <div className="grid gap-4 md:grid-cols-3">
        {podium.map((m, i) => (
          <div key={m.id} className={cn("panel p-5", i === 0 && "ring-1 ring-primary/50")}>
            <div className="flex items-center gap-3">
              <span className="num text-2xl font-bold text-muted-foreground">#{i + 1}</span>
              <Avatar name={m.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-semibold">{m.name}</span>
                  {i === 0 && <Crown className="h-3.5 w-3.5 text-warn" />}
                </div>
                <div className="truncate text-xs text-muted-foreground">{m.platform} · {m.broker}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Mini label="30d" node={<PnL value={m.return30d} prefix="" suffix="%" digits={1} className="text-sm" />} />
              <Mini label="PF" node={<span className="num text-sm">{m.profitFactor.toFixed(2)}</span>} />
              <Mini label="DD" node={<span className="num text-sm text-warn">{m.maxDrawdown}%</span>} />
            </div>
          </div>
        ))}
      </div>

      <div className="panel mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="min-w-52">Master</TableHead>
              {COLS.map((c) => (
                <TableHead key={c.key} className="whitespace-nowrap text-right">
                  <button
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-foreground",
                      sortKey === c.key && "text-primary",
                    )}
                    onClick={() => {
                      if (sortKey === c.key) setAsc((v) => !v);
                      else {
                        setSortKey(c.key);
                        setAsc(false);
                      }
                    }}
                  >
                    {c.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              ))}
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m, i) => (
              <TableRow key={m.id}>
                <TableCell className="num text-muted-foreground">{i + 1}</TableCell>
                <TableCell>
                  <Link
                    to="/masters/$masterId"
                    params={{ masterId: m.id }}
                    className="flex items-center gap-2.5 hover:text-primary"
                  >
                    <Avatar name={m.name} size={28} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{m.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{m.strategy}</div>
                    </div>
                    <Badge variant="outline" className="ml-1 shrink-0 text-[10px]">{m.platform}</Badge>
                  </Link>
                </TableCell>
                {COLS.map((c) => (
                  <TableCell key={c.key} className="whitespace-nowrap text-right">
                    {c.render(m)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/masters/$masterId" params={{ masterId: m.id }}>
                      Copy
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}

function Mini({ label, node }: { label: string; node: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {node}
    </div>
  );
}
