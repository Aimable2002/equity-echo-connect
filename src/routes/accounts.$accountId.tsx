import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Pause, Play, XCircle } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PnL, Stat, StatusDot } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  COPIERS,
  EARNINGS,
  EQUITY_SUMMARY,
  PAYOUTS,
  SPEND_HISTORY,
  WALLET,
  allTrades,
  fmtDate,
  fmtMoney,
  fmtTime,
  getAccount,
  getMaster,
} from "@/lib/mock";

export const Route = createFileRoute("/accounts/$accountId")({
  loader: ({ params }) => {
    const account = getAccount(params.accountId);
    if (!account) throw notFound();
    return { account };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Account not found — CopyDesk" }, { name: "robots", content: "noindex" }],
      };
    }
    const a = loaderData.account;
    const title = `${a.label} — account controls | CopyDesk`;
    const description = `Manage this ${a.role} account on ${a.platform} at ${a.broker}: pause or close copying, review performance, billing and trade activity.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: AccountDetails,
});

const trades = allTrades("account").slice(0, 18);

function AccountDetails() {
  const { account } = Route.useLoaderData();
  const [status, setStatus] = useState(account.status);
  const master = account.copying ? getMaster(account.copying) : null;
  const isMaster = account.role === "master";

  return (
    <AppShell
      title={account.label}
      subtitle={`${account.platform} · ${account.broker} · #${account.login} · opened ${fmtDate(account.createdAt)}`}
      actions={
        <div className="flex items-center gap-2">
          {status === "live" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStatus("paused");
                toast.success("Copying paused — open positions untouched");
              }}
            >
              <Pause className="mr-1 h-4 w-4" /> Pause
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setStatus("live");
                toast.success("Copying resumed");
              }}
              disabled={status === "closed"}
            >
              <Play className="mr-1 h-4 w-4" /> Resume
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              setStatus("closed");
              toast.error("Account closed — all positions flattened");
            }}
          >
            <XCircle className="mr-1 h-4 w-4" /> Close
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Balance" value={fmtMoney(account.balance)} />
        <Stat label="Equity" value={fmtMoney(account.equity)} />
        <Stat label="Open P&L" value={<PnL value={account.openPnl} className="text-2xl" />} />
        <div className="panel p-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Status</div>
          <div className="mt-3">
            <StatusDot status={status} />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {master ? (
              <>
                Copying{" "}
                <Link to="/masters/$masterId" params={{ masterId: master.id }} className="text-primary hover:underline">
                  {master.name}
                </Link>{" "}
                · {account.sizingMode} {account.sizingValue}
              </>
            ) : (
              "Publishing signals to followers"
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">{isMaster ? "Performance" : "Overview"}</TabsTrigger>
          {isMaster && <TabsTrigger value="profile">Public profile</TabsTrigger>}
          {isMaster && <TabsTrigger value="earnings">Earnings</TabsTrigger>}
          {isMaster && <TabsTrigger value="payouts">Payouts</TabsTrigger>}
          {isMaster && <TabsTrigger value="copiers">Copiers</TabsTrigger>}
          {!isMaster && <TabsTrigger value="wallet">Wallet & billing</TabsTrigger>}
          {!isMaster && <TabsTrigger value="spend">Spend history</TabsTrigger>}
          <TabsTrigger value="log">Trade log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <div className="panel p-5">
            <h3 className="font-display font-semibold">Equity vs balance</h3>
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={EQUITY_SUMMARY}>
                  <defs>
                    <linearGradient id="ac" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="t" tick={ax} tickLine={false} axisLine={false} minTickGap={40} />
                  <YAxis tick={ax} tickLine={false} axisLine={false} width={58} />
                  <Tooltip contentStyle={tt} />
                  <Area type="monotone" dataKey="equity" stroke="var(--brand)" strokeWidth={2} fill="url(#ac)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {isMaster && (
          <TabsContent value="profile" className="mt-5">
            <div className="panel max-w-2xl p-6">
              <h3 className="font-display font-semibold">Editable public profile</h3>
              <div className="mt-5 grid gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dn">Display name</Label>
                  <Input id="dn" defaultValue="Jonah Mwangi" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="st">Strategy headline</Label>
                  <Input id="st" defaultValue="London breakout on majors" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bio2">Bio</Label>
                  <Textarea id="bio2" rows={4} defaultValue="Fixed 1% risk per position, no grid, no martingale. Sessions: London open and NY overlap." />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fee">Performance fee (%)</Label>
                    <Input id="fee" className="num" defaultValue="20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mf">Monthly fee (USD)</Label>
                    <Input id="mf" className="num" defaultValue="29" />
                  </div>
                </div>
                <Button className="w-fit" onClick={() => toast.success("Profile saved")}>
                  Save profile
                </Button>
              </div>
            </div>
          </TabsContent>
        )}

        {isMaster && (
          <TabsContent value="earnings" className="mt-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Earnings this month" value={fmtMoney(2140)} accent />
              <Stat label="Lifetime fees" value={fmtMoney(28420)} />
              <Stat label="Active copiers" value={COPIERS.filter((c) => c.status === "live").length.toString()} />
            </div>
            <div className="panel mt-6 p-5">
              <h3 className="font-display font-semibold">Fee income by month</h3>
              <div className="mt-5 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={EARNINGS}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={ax} tickLine={false} axisLine={false} />
                    <YAxis tick={ax} tickLine={false} axisLine={false} width={54} />
                    <Tooltip contentStyle={tt} cursor={{ fill: "var(--accent)" }} />
                    <Bar dataKey="fees" fill="var(--brand)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        )}

        {isMaster && (
          <TabsContent value="payouts" className="mt-5">
            <div className="panel overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <h3 className="font-display font-semibold">Payout requests</h3>
                <Button size="sm" onClick={() => toast.success("Payout request submitted for review")}>
                  Request payout
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PAYOUTS.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="num text-xs">{p.id}</TableCell>
                      <TableCell>{p.period}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.method}</TableCell>
                      <TableCell className="num text-xs text-muted-foreground">{fmtDate(p.requested)}</TableCell>
                      <TableCell className="num text-right">{fmtMoney(p.amount)}</TableCell>
                      <TableCell className="text-right">
                        <StatusDot status={p.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        )}

        {isMaster && (
          <TabsContent value="copiers" className="mt-5">
            <div className="panel overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Copier</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Sizing</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead className="text-right">Equity</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COPIERS.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="num text-xs">{c.account}</TableCell>
                      <TableCell>{c.broker}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.sizing}</TableCell>
                      <TableCell className="num text-xs text-muted-foreground">{fmtDate(c.since)}</TableCell>
                      <TableCell className="num text-right">{fmtMoney(c.equity)}</TableCell>
                      <TableCell className="text-right">
                        <StatusDot status={c.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        )}

        {!isMaster && (
          <TabsContent value="wallet" className="mt-5">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="panel p-6">
                <h3 className="font-display font-semibold">Wallet</h3>
                <div className="num mt-4 text-4xl font-bold">{fmtMoney(WALLET.balance)}</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fees are debited from your wallet — never from your broker account.
                </p>
                <div className="mt-5 flex gap-2">
                  <Button asChild>
                    <Link to="/checkout">Top up</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/wallet">Manage billing</Link>
                  </Button>
                </div>
              </div>
              <div className="panel p-6">
                <h3 className="font-display font-semibold">Subscription</h3>
                <div className="mt-4 flex items-center gap-2">
                  <Badge>{WALLET.plan}</Badge>
                  <StatusDot status={WALLET.status} />
                </div>
                <dl className="mt-5 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Monthly cost</dt>
                    <dd className="num">{fmtMoney(WALLET.planPrice)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Renews</dt>
                    <dd className="num">{fmtDate(WALLET.renews)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Payment method</dt>
                    <dd className="num">Card ****4242</dd>
                  </div>
                </dl>
              </div>
            </div>
          </TabsContent>
        )}

        {!isMaster && (
          <TabsContent value="spend" className="mt-5">
            <div className="panel overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Master</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SPEND_HISTORY.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="num text-xs">{s.id}</TableCell>
                      <TableCell className="num text-xs text-muted-foreground">{fmtDate(s.date)}</TableCell>
                      <TableCell>{s.master}</TableCell>
                      <TableCell className="text-muted-foreground">{s.type}</TableCell>
                      <TableCell className="num text-right">{fmtMoney(s.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        )}

        <TabsContent value="log" className="mt-5">
          <div className="panel overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">Lots</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="num text-xs text-muted-foreground">{t.id}</TableCell>
                    <TableCell className="num font-medium">{t.symbol}</TableCell>
                    <TableCell className={t.side === "BUY" ? "text-long" : "text-short"}>{t.side}</TableCell>
                    <TableCell className="num text-right">{t.lots.toFixed(2)}</TableCell>
                    <TableCell className="num text-xs text-muted-foreground">{fmtTime(t.open)}</TableCell>
                    <TableCell className="num text-xs text-muted-foreground">{t.close ? fmtTime(t.close) : "—"}</TableCell>
                    <TableCell className="text-right">
                      <PnL value={t.pnl} className="text-sm" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

const ax = { fontSize: 11, fill: "var(--muted-foreground)" } as const;
const tt = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
} as const;
