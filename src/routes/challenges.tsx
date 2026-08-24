import { createFileRoute } from "@tanstack/react-router";
import { Target, Trophy } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Stat, StatusDot } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ACTIVE_CHALLENGE, CHALLENGES, CHALLENGE_HISTORY, fmtDate, fmtMoney } from "@/lib/mock";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Trading challenges — earn a funded master seat | CopyDesk" },
      {
        name: "description",
        content:
          "Prop-firm style challenge programs with profit targets and drawdown limits. Track live progress on an active attempt and review past outcomes.",
      },
      { property: "og:title", content: "Trading challenges — funded master seats | CopyDesk" },
      {
        property: "og:description",
        content: "Hit the profit target inside the drawdown limits and unlock master status.",
      },
    ],
  }),
  component: ChallengesPage,
});

function ChallengesPage() {
  const c = ACTIVE_CHALLENGE;
  return (
    <AppShell title="Challenges" subtitle="Prove the edge, unlock the seat">
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active attempt</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Program" value={c.name} hint={`Day ${c.day} · started ${fmtDate(c.startedAt)}`} />
            <Stat label="Equity" value={fmtMoney(c.equity)} hint={`Start ${fmtMoney(c.accountSize)}`} />
            <Stat label="Profit" value={`${c.profitPct}%`} accent hint={`Target ${c.profitTarget}%`} />
            <Stat label="Drawdown used" value={`${c.drawdownPct}%`} hint={`Limit ${c.maxDrawdown}%`} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="panel p-5 lg:col-span-2">
              <h3 className="font-display font-semibold">Equity toward target</h3>
              <div className="mt-5 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={c.curve}>
                    <defs>
                      <linearGradient id="ch" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="day" tick={ax} tickLine={false} axisLine={false} />
                    <YAxis tick={ax} tickLine={false} axisLine={false} width={60} domain={[24000, 28000]} />
                    <Tooltip contentStyle={tt} />
                    <ReferenceLine y={c.accountSize * (1 + c.profitTarget / 100)} stroke="var(--long)" strokeDasharray="4 4" label={{ value: "Target", fill: "var(--long)", fontSize: 11 }} />
                    <ReferenceLine y={c.accountSize * (1 - c.maxDrawdown / 100)} stroke="var(--short)" strokeDasharray="4 4" label={{ value: "Breach", fill: "var(--short)", fontSize: 11 }} />
                    <Area type="monotone" dataKey="equity" stroke="var(--brand)" strokeWidth={2} fill="url(#ch)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel p-5">
              <h3 className="font-display font-semibold">Objectives</h3>
              <div className="mt-5 space-y-5">
                <Objective label="Profit target" value={c.profitPct} max={c.profitTarget} unit="%" tone="long" />
                <Objective label="Daily loss used" value={c.dailyLossPct} max={c.maxDailyLoss} unit="%" tone="warn" />
                <Objective label="Max drawdown used" value={c.drawdownPct} max={c.maxDrawdown} unit="%" tone="warn" />
                <Objective label="Minimum trading days" value={c.tradingDays} max={c.minDays} unit=" days" tone="long" />
              </div>
              <Button className="mt-6 w-full" variant="outline" onClick={() => toast.success("Progress report emailed")}>
                Email progress report
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="programs" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {CHALLENGES.map((p) => (
              <div key={p.id} className="panel flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <Target className="h-5 w-5 text-primary" />
                  <Badge variant="outline" className="num text-[10px]">{fmtMoney(p.accountSize)}</Badge>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{p.name}</h3>
                <div className="num mt-1 text-2xl font-bold">
                  ${p.fee}
                  <span className="text-sm font-normal text-muted-foreground"> entry</span>
                </div>
                <dl className="mt-5 flex-1 space-y-2.5 text-sm">
                  <Row k="Profit target" v={`${p.profitTarget}%`} />
                  <Row k="Max daily loss" v={`${p.maxDailyLoss}%`} />
                  <Row k="Max drawdown" v={`${p.maxDrawdown}%`} />
                  <Row k="Minimum days" v={`${p.minDays}`} />
                </dl>
                <div className="mt-5 rounded-md border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
                  <Trophy className="mb-1.5 h-3.5 w-3.5 text-warn" />
                  {p.reward}
                </div>
                <Button className="mt-5" onClick={() => toast.success(`${p.name} attempt started`)}>
                  Start attempt
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="panel overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attempt</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Ended</TableHead>
                  <TableHead className="text-right">Final result</TableHead>
                  <TableHead className="text-right">Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CHALLENGE_HISTORY.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="num text-xs">{h.id}</TableCell>
                    <TableCell>{h.program}</TableCell>
                    <TableCell className="num text-xs text-muted-foreground">{fmtDate(h.started)}</TableCell>
                    <TableCell className="num text-xs text-muted-foreground">{fmtDate(h.ended)}</TableCell>
                    <TableCell className={`num text-right ${h.finalPct >= 0 ? "text-long" : "text-short"}`}>
                      {h.finalPct > 0 ? "+" : ""}
                      {h.finalPct}%
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusDot status={h.result} />
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

function Objective({
  label,
  value,
  max,
  unit,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  tone: "long" | "warn";
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`num ${tone === "long" ? "text-long" : "text-warn"}`}>
          {value}
          {unit} / {max}
          {unit}
        </span>
      </div>
      <Progress value={Math.min(100, (value / max) * 100)} className="mt-2 h-1.5" />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="num">{v}</dd>
    </div>
  );
}

const ax = { fontSize: 11, fill: "var(--muted-foreground)" } as const;
const tt = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
} as const;
