import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Gauge,
  LineChart,
  Link2,
  Scale,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { MarketingFooter, MarketingNav } from "@/components/marketing";
import { Avatar, PnL, SectionTitle } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MASTERS,
  PLANS,
  PLATFORM_STATS,
  SYMBOLS,
  fmtMoney,
  fmtPct,
} from "@/lib/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CopyDesk — Real-time copy trading for MT5 & cTrader" },
      {
        name: "description",
        content:
          "Mirror a verified master trader's live forex and CFD fills into your own MT5 or cTrader account in under 40ms, with risk-normalised position sizing.",
      },
      { property: "og:title", content: "CopyDesk — Real-time copy trading for MT5 & cTrader" },
      {
        property: "og:description",
        content:
          "Fill-level trade replication from verified masters into your own broker account. Transparent stats, risk-normalised sizing, micro-account support.",
      },
    ],
  }),
  component: Landing,
});

const top = [...MASTERS].filter((m) => m.visible).sort((a, b) => b.return30d - a.return30d).slice(0, 3);

function Landing() {
  return (
    <div className="min-h-screen">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-20 sm:pt-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-long" />
            Relay live · {PLATFORM_STATS.copiedToday.toLocaleString()} trades mirrored today
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-[1.03] sm:text-6xl lg:text-7xl">
            Their fill.{" "}
            <span className="brand-gradient-text">Your account.</span>
            <br />
            Thirty-eight milliseconds apart.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            CopyDesk mirrors a master trader's live forex and CFD positions straight into your own
            MT5 or cTrader account at your broker — sized to your equity, your risk, your rules.
            No pooled funds. No withdrawal of your capital. Ever.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                Start copying <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/masters">Browse masters</Link>
            </Button>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Median relay latency", value: `${PLATFORM_STATS.latencyMs} ms`, icon: Zap },
              {
                label: "Follower P&L, open signals",
                value: fmtMoney(PLATFORM_STATS.openSignalPnl),
                icon: Activity,
                good: true,
              },
              { label: "Verified masters", value: PLATFORM_STATS.masters.toString(), icon: ShieldCheck },
              {
                label: "Live connected accounts",
                value: PLATFORM_STATS.liveAccounts.toLocaleString(),
                icon: Link2,
              },
            ].map((s) => (
              <div key={s.label} className="bg-surface p-5">
                <s.icon className="h-4 w-4 text-primary" />
                <div
                  className={`num mt-3 text-2xl font-semibold ${s.good ? "text-long" : ""}`}
                >
                  {s.good ? "+" : ""}
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ticker */}
        <div className="relative flex overflow-hidden border-t border-border bg-surface/60 py-2.5">
          <div className="ticker-track flex shrink-0 gap-8 whitespace-nowrap px-4">
            {[...SYMBOLS, ...SYMBOLS].map((s, i) => {
              const v = ((i * 37) % 90) / 10 - 4;
              return (
                <span key={s + i} className="num flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{s}</span>
                  <span className={v >= 0 ? "text-long" : "text-short"}>{fmtPct(v, 2)}</span>
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brokers */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="text-sm text-muted-foreground">
              Connects to any MT5-based broker — plus cTrader for masters
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-display text-sm font-semibold text-muted-foreground">
              {["IC Markets", "Pepperstone", "Exness", "Vantage", "FXPesa", "FxPro (cTrader)", "Axi (cTrader)"].map(
                (b) => (
                  <span key={b}>{b}</span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <SectionTitle
            eyebrow="From signup to mirrored fills"
            title="Four steps. Roughly nine minutes."
            sub="You never send us your money. You connect a read-and-trade API session to your own broker account, and we push orders into it."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                t: "Create your desk",
                d: "Sign up and pick your side: publish your trades as a master, or copy someone as a follower.",
              },
              {
                n: "02",
                t: "Connect your broker",
                d: "Enter your MT5 login, server and investor-grade trading credentials — or link cTrader via OAuth if you're a master.",
              },
              {
                n: "03",
                t: "Set your sizing rule",
                d: "Proportional, fixed lot, or % risk per trade. Micro-scaling drops to 0.01 lots so a $200 account still receives every signal.",
              },
              {
                n: "04",
                t: "Go live",
                d: "The relay opens, modifies and closes positions in your account the moment the master's fill is confirmed.",
              },
            ].map((s) => (
              <div key={s.n} className="panel p-6">
                <div className="num text-sm font-semibold text-primary">{s.n}</div>
                <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <SectionTitle
            eyebrow="Why traders trust the relay"
            title="Copy trading fails on the details. We built for the details."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                t: "Real-time fill replication",
                d: "We don't poll a statement every 30 seconds. We subscribe to execution events and place your order on confirmation — median 38ms, p99 under 140ms. Partial fills, SL/TP edits and partial closes all replicate.",
              },
              {
                icon: Scale,
                t: "Risk-normalised sizing",
                d: "A master risking 1% on 4 lots becomes 1% on your equity, not 4 blind lots. Micro-scaling keeps small accounts in every trade instead of skipping signals they can't afford.",
              },
              {
                icon: LineChart,
                t: "Transparency by default",
                d: "Every master's track record is computed from executed fills, not screenshots. Max drawdown, profit factor and losing months are shown as prominently as returns.",
              },
            ].map((f) => (
              <div key={f.t} className="panel p-7">
                <span className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface-2">
                  <f.icon className="h-5 w-5 text-primary" />
                </span>
                <h3 className="mt-5 text-xl font-semibold">{f.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Your capital stays at your broker", "CopyDesk never has withdrawal rights."],
              ["Drawdown circuit breaker", "Auto-pause copying at a loss threshold you set."],
              [`${PLATFORM_STATS.uptime}% relay uptime`, "Rolling 90-day, published monthly."],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-3 rounded-lg border border-border bg-surface p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <div className="text-sm font-medium">{t}</div>
                  <div className="text-xs text-muted-foreground">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top masters */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Live track records"
              title="Top-performing masters right now"
              sub="Ranked on 30-day return from verified fills. Drawdown shown alongside — always."
            />
            <Button asChild variant="outline">
              <Link to="/leaderboard">Full leaderboard</Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {top.map((m) => (
              <Link
                key={m.id}
                to="/masters/$masterId"
                params={{ masterId: m.id }}
                className="panel group p-6 transition-all hover:border-primary/50"
                style={{ transitionProperty: "border-color, box-shadow" }}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{m.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {m.handle} · {m.platform}
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
                    {m.verifiedMonths}mo verified
                  </Badge>
                </div>
                <div className="mt-5 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={m.equityCurve.slice(-60)}>
                      <defs>
                        <linearGradient id={`g-${m.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="var(--brand)"
                        strokeWidth={1.8}
                        fill={`url(#g-${m.id})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">30d</div>
                    <PnL value={m.return30d} prefix="" suffix="%" digits={1} className="text-sm" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Max DD</div>
                    <div className="num text-sm font-medium text-warn">{m.maxDrawdown}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Copiers</div>
                    <div className="num text-sm font-medium">{m.followers.toLocaleString()}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <SectionTitle
            eyebrow="Pricing"
            title="Flat monthly access. Masters set their own fee."
            sub="No spread markup, no hidden per-lot commission from us. What your broker charges is between you and your broker."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={`panel flex flex-col p-7 ${p.highlight ? "ring-1 ring-primary/60" : ""}`}
                style={p.highlight ? { boxShadow: "var(--shadow-lift)" } : undefined}
              >
                {p.highlight && (
                  <Badge className="mb-4 w-fit">Most popular</Badge>
                )}
                <div className="font-display text-lg font-semibold">{p.name}</div>
                <div className="num mt-3 text-4xl font-bold">
                  ${p.price}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-7" variant={p.highlight ? "default" : "outline"}>
                  <Link to="/pricing">{p.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center">
          <Gauge className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-6 text-4xl font-bold sm:text-5xl">
            Connect an account. Copy your first fill today.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Free tier, one master, no card. Disconnect any time from your broker terminal.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/auth">
              Create your desk <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
