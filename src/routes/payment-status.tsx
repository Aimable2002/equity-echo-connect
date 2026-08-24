import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { Logo, StatusDot } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TRANSACTIONS, fmtDate, fmtMoney } from "@/lib/mock";

export const Route = createFileRoute("/payment-status")({
  head: () => ({
    meta: [
      { title: "Payment status lookup — CopyDesk" },
      {
        name: "description",
        content:
          "Enter a payment reference to check whether your CopyDesk transaction is pending, completed or failed, with method and amount details.",
      },
      { property: "og:title", content: "Payment status lookup — CopyDesk" },
      {
        property: "og:description",
        content: "Look up any CopyDesk payment reference to see its current status.",
      },
    ],
  }),
  component: PaymentStatus,
});

type Tx = (typeof TRANSACTIONS)[number];

function PaymentStatus() {
  const [ref, setRef] = useState("TX-88214");
  const [result, setResult] = useState<Tx | null | undefined>(undefined);

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(TRANSACTIONS.find((t) => t.id.toLowerCase() === ref.trim().toLowerCase()) ?? null);
  };

  const Icon =
    result?.status === "completed" ? CheckCircle2 : result?.status === "failed" ? XCircle : Clock;
  const tone =
    result?.status === "completed" ? "text-long" : result?.status === "failed" ? "text-short" : "text-warn";

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-5">
          <Logo />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-3xl font-bold">Check a payment</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the reference from your receipt, bank narration or SMS confirmation.
        </p>

        <form onSubmit={lookup} className="panel mt-8 flex flex-wrap items-end gap-3 p-5">
          <div className="min-w-56 flex-1 space-y-1.5">
            <Label htmlFor="ref">Payment reference</Label>
            <Input id="ref" className="num" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="TX-88214" />
          </div>
          <Button type="submit">
            <Search className="mr-1 h-4 w-4" /> Look up
          </Button>
        </form>

        {result === null && (
          <div className="panel mt-6 p-6 text-sm text-muted-foreground">
            No payment found for <span className="num text-foreground">{ref}</span>. References look
            like <span className="num">TX-88214</span>. Bank transfers can take up to 2 business days
            to appear.
          </div>
        )}

        {result && (
          <div className="panel mt-6 p-6">
            <div className="flex items-center gap-3">
              <Icon className={`h-6 w-6 ${tone}`} />
              <div>
                <div className="font-display text-xl font-semibold capitalize">{result.status}</div>
                <div className="text-xs text-muted-foreground">Reference {result.id}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="num text-2xl font-semibold">{fmtMoney(Math.abs(result.amount))}</div>
                <StatusDot status={result.status} />
              </div>
            </div>
            <dl className="mt-6 grid gap-3 border-t border-border pt-5 text-sm sm:grid-cols-2">
              <Row k="Description" v={result.desc} />
              <Row k="Method" v={result.method} />
              <Row k="Date" v={fmtDate(result.date)} />
              <Row k="Direction" v={result.amount >= 0 ? "Credit to wallet" : "Debit from wallet"} />
            </dl>
            {result.status === "pending" && (
              <p className="mt-5 rounded-md border border-border bg-surface-2 p-4 text-xs text-muted-foreground">
                Awaiting settlement confirmation from the payment provider. Your wallet is credited
                automatically once funds clear — no action needed.
              </p>
            )}
            {result.status === "failed" && (
              <Button asChild className="mt-5">
                <Link to="/checkout">Retry payment</Link>
              </Button>
            )}
          </div>
        )}

        <div className="mt-10 text-sm">
          <div className="text-muted-foreground">Recent references on this account</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TRANSACTIONS.slice(0, 5).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setRef(t.id);
                  setResult(t);
                }}
                className="num rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:border-primary"
              >
                {t.id}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          <Link to="/wallet" className="hover:text-foreground">
            ← Back to wallet
          </Link>
        </p>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="mt-0.5">{v}</dd>
    </div>
  );
}
