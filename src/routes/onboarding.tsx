import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Radio, Users } from "lucide-react";
import { toast } from "sonner";
import { Logo, Avatar, PnL } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BROKERS, MASTERS, type Platform } from "@/lib/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your desk — CopyDesk onboarding" },
      {
        name: "description",
        content:
          "Choose whether you publish trades as a master or copy one as a follower, connect your MT5 or cTrader account and set your position sizing rule.",
      },
      { property: "og:title", content: "Set up your desk — CopyDesk onboarding" },
      {
        property: "og:description",
        content: "Connect your broker account and configure risk-normalised copy sizing.",
      },
    ],
  }),
  component: Onboarding,
});

type Role = "master" | "follower" | null;

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>(null);
  const [platform, setPlatform] = useState<Platform>("MT5");
  const [masterId, setMasterId] = useState(MASTERS[0]!.id);
  const [sizing, setSizing] = useState<"proportional" | "fixed-lot" | "risk-percent" | "micro-scale">(
    "risk-percent",
  );
  const [risk, setRisk] = useState(0.75);

  const steps = role === "master" ? ["Role", "Platform", "Account"] : ["Role", "Master", "Account", "Sizing"];
  const last = steps.length - 1;

  const finish = () => {
    toast.success(role === "master" ? "Master account submitted for review" : "Copying started");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Logo />
          <span className="text-xs text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-12">
        <div className="mb-10 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] num",
                  i < step
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === step
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className={cn("text-xs", i === step ? "text-foreground" : "text-muted-foreground")}>
                {s}
              </span>
              {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <Panel title="How are you joining?" sub="You can add the other side later from your dashboard.">
            <div className="grid gap-4 sm:grid-cols-2">
              <RoleCard
                active={role === "master"}
                onClick={() => setRole("master")}
                icon={Radio}
                title="Master"
                desc="Publish your live fills. Followers mirror them and you earn a performance or monthly fee."
                bullets={["MT5 or cTrader", "Public profile & directory listing", "Monthly payouts"]}
              />
              <RoleCard
                active={role === "follower"}
                onClick={() => setRole("follower")}
                icon={Users}
                title="Follower"
                desc="Copy a verified master into your own broker account, sized to your equity and risk."
                bullets={["MT5 brokers", "Risk-normalised sizing", "Pause any time"]}
              />
            </div>
          </Panel>
        )}

        {step === 1 && role === "master" && (
          <Panel title="Where do you trade?" sub="This is the account whose fills get published.">
            <div className="grid gap-4 sm:grid-cols-2">
              {(["MT5", "cTrader"] as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={cn(
                    "rounded-lg border p-5 text-left transition-colors",
                    platform === p ? "border-primary bg-surface-2" : "border-border bg-surface hover:border-border",
                  )}
                >
                  <div className="font-display text-lg font-semibold">{p}</div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {p === "MT5"
                      ? "Connect via login, password and server. Works with any MT5 broker."
                      : "Connect via cTrader Open API OAuth. No password shared."}
                  </p>
                </button>
              ))}
            </div>
          </Panel>
        )}

        {step === 1 && role === "follower" && (
          <Panel title="Pick a master to copy" sub="Change or add more later — Pro allows unlimited subscriptions.">
            <div className="space-y-3">
              {MASTERS.filter((m) => m.visible)
                .slice(0, 5)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMasterId(m.id)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors",
                      masterId === m.id ? "border-primary bg-surface-2" : "border-border bg-surface",
                    )}
                  >
                    <Avatar name={m.name} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{m.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {m.strategy} · {m.platform}
                      </div>
                    </div>
                    <div className="text-right">
                      <PnL value={m.return30d} prefix="" suffix="%" digits={1} className="text-sm" />
                      <div className="text-[11px] text-muted-foreground">DD {m.maxDrawdown}%</div>
                    </div>
                  </button>
                ))}
            </div>
          </Panel>
        )}

        {((step === 2 && role === "master") || (step === 2 && role === "follower")) && (
          <Panel
            title="Connect your broker account"
            sub={
              role === "master" && platform === "cTrader"
                ? "cTrader uses OAuth — we only need your broker and account label."
                : "Use your trading credentials. CopyDesk cannot withdraw funds."
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="label">Account label</Label>
                <Input id="label" placeholder="Primary follower — IC Markets" />
              </div>
              <div className="space-y-1.5">
                <Label>Broker</Label>
                <Select defaultValue={BROKERS[0]!.name}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BROKERS.filter((b) => (role === "master" ? b.platform === platform : b.platform === "MT5")).map(
                      (b) => (
                        <SelectItem key={b.name} value={b.name}>
                          {b.name} · {b.platform}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="server">Server</Label>
                <Input id="server" placeholder="ICMarkets-Live12" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login">Account login</Label>
                <Input id="login" placeholder="51840223" className="num" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw">Trading password</Label>
                <Input id="pw" type="password" placeholder="••••••••" />
              </div>
              {role === "master" && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="bio">Public strategy description</Label>
                  <Textarea id="bio" rows={3} placeholder="London breakout on majors, fixed 1% risk, no grid…" />
                </div>
              )}
            </div>
          </Panel>
        )}

        {step === 3 && role === "follower" && (
          <Panel title="How should your positions be sized?" sub="This is the single most important setting on the platform.">
            <div className="grid gap-3">
              {[
                {
                  id: "proportional" as const,
                  t: "Proportional to equity",
                  d: "Your lot = master lot × (your equity ÷ master equity). The classic 1:1 mirror.",
                },
                {
                  id: "risk-percent" as const,
                  t: "Fixed % risk per trade",
                  d: "Every trade risks the same slice of your equity, regardless of the master's own sizing.",
                },
                {
                  id: "fixed-lot" as const,
                  t: "Fixed lot size",
                  d: "Always trade the same volume. Simple, but ignores stop distance.",
                },
                {
                  id: "micro-scale" as const,
                  t: "Micro-scaling (small accounts)",
                  d: "Scales down to your broker's 0.01 minimum and tracks the fractional remainder, so a $150 account still receives every single signal instead of skipping the ones it can't afford.",
                },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSizing(o.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    sizing === o.id ? "border-primary bg-surface-2" : "border-border bg-surface",
                  )}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {o.t}
                    {o.id === "micro-scale" && <Badge variant="outline" className="text-[10px]">for accounts under $500</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{o.d}</p>
                </button>
              ))}
            </div>

            {sizing === "risk-percent" && (
              <div className="mt-6 rounded-lg border border-border bg-surface p-5">
                <div className="flex items-center justify-between">
                  <Label>Risk per trade</Label>
                  <span className="num text-primary">{risk.toFixed(2)}%</span>
                </div>
                <Slider
                  className="mt-4"
                  value={[risk]}
                  min={0.1}
                  max={3}
                  step={0.05}
                  onValueChange={(v) => setRisk(v[0] ?? 0.75)}
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  On a $4,820 account that's about ${(4820 * risk / 100).toFixed(2)} at stop-loss per position.
                </p>
              </div>
            )}
          </Panel>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button
            disabled={step === 0 && !role}
            onClick={() => (step === last ? finish() : setStep((s) => s + 1))}
          >
            {step === last ? "Finish setup" : "Continue"} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section>
      <h1 className="text-2xl font-bold">{title}</h1>
      {sub && <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>}
      <div className="mt-7">{children}</div>
    </section>
  );
}

function RoleCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
  bullets,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  desc: string;
  bullets: string[];
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border p-6 text-left transition-colors",
        active ? "border-primary bg-surface-2" : "border-border bg-surface",
      )}
    >
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-4 font-display text-lg font-semibold">{title}</div>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
      <ul className="mt-4 space-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3 w-3 text-primary" /> {b}
          </li>
        ))}
      </ul>
    </button>
  );
}
