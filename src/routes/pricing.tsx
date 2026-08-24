import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { MarketingFooter, MarketingNav } from "@/components/marketing";
import { SectionTitle } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PLANS } from "@/lib/mock";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — copy-trading plans from free to Desk | CopyDesk" },
      {
        name: "description",
        content:
          "Flat monthly access from $0. Compare Starter, Pro and Desk tiers: account limits, relay priority, sizing engine and master publishing.",
      },
      { property: "og:title", content: "Pricing — copy-trading plans | CopyDesk" },
      {
        property: "og:description",
        content: "Free tier for one master, Pro for multi-account followers, Desk for master traders.",
      },
    ],
  }),
  component: Pricing,
});

const FAQ = [
  [
    "Do you take a cut of my trading profits?",
    "No. CopyDesk charges a flat monthly subscription. Individual masters may charge their own performance or monthly fee, which is always shown on their profile before you start copying.",
  ],
  [
    "Can I copy on a $150 account?",
    "Yes. Micro-scaling drops volume to your broker's 0.01 minimum and tracks the fractional remainder so you still receive every signal instead of skipping the ones your equity can't carry.",
  ],
  [
    "What happens if I cancel?",
    "Copying stops at the end of the paid period. Your open positions stay in your account — CopyDesk never force-closes them on cancellation, and you keep terminal control at all times.",
  ],
  [
    "Which platforms are supported?",
    "Followers connect any MT5-based broker. Masters can publish from MT5 or cTrader. MT4 is not supported.",
  ],
] as const;

function Pricing() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative mx-auto max-w-7xl px-5 py-20">
          <SectionTitle
            eyebrow="Pricing"
            title="One flat fee. No spread markup."
            sub="Your broker charges what your broker charges. We don't touch it, mark it up, or take a rebate for routing you."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={`panel flex flex-col p-7 ${p.highlight ? "ring-1 ring-primary/60" : ""}`}
                style={p.highlight ? { boxShadow: "var(--shadow-lift)" } : undefined}
              >
                {p.highlight && <Badge className="mb-4 w-fit">Most popular</Badge>}
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
                  <Link to="/checkout">{p.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Prices in USD. Local currency conversion (KES, NGN, GHS, ZAR) is shown at checkout with
            the rate applied.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <SectionTitle title="Questions traders actually ask" />
          <Accordion type="single" collapsible className="mt-8">
            {FAQ.map(([q, a]) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
