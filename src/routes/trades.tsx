import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PnL, Stat } from "@/components/brand";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ACCOUNTS, SYMBOLS, allTrades, fmtMoney, fmtTime } from "@/lib/mock";

export const Route = createFileRoute("/trades")({
  head: () => ({
    meta: [
      { title: "Trade history — mirrored fills log | CopyDesk" },
      {
        name: "description",
        content:
          "Filter every historical copied trade by account, symbol, direction and result, with entry and exit times, pips and realised P&L.",
      },
      { property: "og:title", content: "Trade history — mirrored fills log | CopyDesk" },
      {
        property: "og:description",
        content: "A filterable log of every mirrored trade across your connected accounts.",
      },
    ],
  }),
  component: Trades,
});

const ALL = allTrades();

function Trades() {
  const [account, setAccount] = useState(ACCOUNTS[0]!.id);
  const [symbol, setSymbol] = useState("all");
  const [side, setSide] = useState("all");
  const [result, setResult] = useState("all");
  const [q, setQ] = useState("");

  const rows = useMemo(
    () =>
      ALL.filter((t) => (symbol === "all" ? true : t.symbol === symbol))
        .filter((t) => (side === "all" ? true : t.side === side))
        .filter((t) => (result === "all" ? true : result === "win" ? t.pnl >= 0 : t.pnl < 0))
        .filter((t) => (q ? t.symbol.toLowerCase().includes(q.toLowerCase()) || t.id.includes(q) : true)),
    [symbol, side, result, q],
  );

  const net = rows.reduce((s, t) => s + t.pnl, 0);
  const wins = rows.filter((t) => t.pnl >= 0).length;

  return (
    <AppShell title="Trade history" subtitle={`${rows.length} closed trades matching filters`}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Net realised P&L" value={<PnL value={net} digits={0} className="text-2xl" />} />
        <Stat label="Closed trades" value={rows.length.toString()} />
        <Stat label="Win rate" value={`${rows.length ? ((wins / rows.length) * 100).toFixed(1) : "0.0"}%`} accent />
        <Stat
          label="Avg trade"
          value={<PnL value={rows.length ? net / rows.length : 0} className="text-2xl" />}
        />
      </div>

      <div className="panel mt-6 flex flex-wrap items-center gap-3 p-4">
        <Select value={account} onValueChange={setAccount}>
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNTS.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All symbols</SelectItem>
            {SYMBOLS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={side} onValueChange={setSide}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Both sides</SelectItem>
            <SelectItem value="BUY">Buy</SelectItem>
            <SelectItem value="SELL">Sell</SelectItem>
          </SelectContent>
        </Select>
        <Select value={result} onValueChange={setResult}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All results</SelectItem>
            <SelectItem value="win">Winners</SelectItem>
            <SelectItem value="loss">Losers</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ticket or symbol…"
          className="w-52"
        />
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => toast.success("CSV export queued")}>
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="panel mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="text-right">Lots</TableHead>
              <TableHead className="text-right">Entry</TableHead>
              <TableHead className="text-right">Exit</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Closed</TableHead>
              <TableHead className="text-right">Pips</TableHead>
              <TableHead className="text-right">P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="num text-xs text-muted-foreground">{t.id}</TableCell>
                <TableCell className="num font-medium">{t.symbol}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={t.side === "BUY" ? "border-long/40 text-long" : "border-short/40 text-short"}
                  >
                    {t.side}
                  </Badge>
                </TableCell>
                <TableCell className="num text-right">{t.lots.toFixed(2)}</TableCell>
                <TableCell className="num text-right">{t.openPrice}</TableCell>
                <TableCell className="num text-right">{t.closePrice}</TableCell>
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
        {rows.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No trades match these filters.
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Realised totals exclude swap and commission charged by your broker. Account balance{" "}
        {fmtMoney(ACCOUNTS.find((a) => a.id === account)?.balance ?? 0)}.
      </p>
    </AppShell>
  );
}
