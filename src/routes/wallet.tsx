import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Stat, StatusDot } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PLANS, TRANSACTIONS, WALLET, fmtDate, fmtMoney } from "@/lib/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet, plans & billing — CopyDesk" },
      {
        name: "description",
        content:
          "Top up your CopyDesk wallet, compare subscription tiers, manage or reactivate billing and review your full transaction history.",
      },
      { property: "og:title", content: "Wallet, plans & billing — CopyDesk" },
      {
        property: "og:description",
        content: "Manage your wallet balance, subscription tier and payment history.",
      },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const [status, setStatus] = useState<"active" | "cancelled">(WALLET.status);
  const [plan, setPlan] = useState("pro");
  const [amount, setAmount] = useState("100");

  return (
    <AppShell title="Wallet & billing" subtitle="Fees are debited here — never from your broker account">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Wallet balance" value={fmtMoney(WALLET.balance)} accent hint={`≈ ${(WALLET.balance * WALLET.fxRate).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${WALLET.localCurrency}`} />
        <Stat label="Current plan" value={WALLET.plan} hint={`${fmtMoney(WALLET.planPrice)}/month`} />
        <Stat label="Next charge" value={fmtDate(WALLET.renews)} hint={status === "cancelled" ? "Subscription cancelled" : "Auto-renew on"} />
        <Stat label="Spend this month" value={fmtMoney(133.2)} hint="Copy fees + subscription" />
      </div>

      <Tabs defaultValue="topup" className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="topup">Top up</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="history">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="topup" className="mt-6">
          <div className="panel max-w-xl p-6">
            <h3 className="font-display font-semibold">Add funds to your wallet</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {["25", "50", "100", "250", "500"].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={cn(
                    "num rounded-md border px-4 py-2 text-sm transition-colors",
                    amount === v ? "border-primary text-primary" : "border-border text-muted-foreground",
                  )}
                >
                  ${v}
                </button>
              ))}
            </div>
            <div className="mt-5 space-y-1.5">
              <Label htmlFor="amt">Custom amount (USD)</Label>
              <Input id="amt" className="num" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                ≈ {(Number(amount || 0) * WALLET.fxRate).toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
                {WALLET.localCurrency} at today's rate of {WALLET.fxRate}.
              </p>
            </div>
            <Button asChild className="mt-6">
              <Link to="/checkout">
                <Plus className="mr-1 h-4 w-4" /> Continue to payment
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={cn("panel flex flex-col p-6", plan === p.id && "ring-1 ring-primary/60")}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-semibold">{p.name}</span>
                  {plan === p.id && <Badge>Current</Badge>}
                </div>
                <div className="num mt-3 text-3xl font-bold">
                  ${p.price}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                  {p.features.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
                <Button
                  className="mt-6"
                  variant={plan === p.id ? "outline" : "default"}
                  disabled={plan === p.id}
                  onClick={() => {
                    setPlan(p.id);
                    toast.success(`Switched to ${p.name}`);
                  }}
                >
                  {plan === p.id ? "Current plan" : `Switch to ${p.name}`}
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="panel p-6">
              <h3 className="font-display font-semibold">Subscription</h3>
              <div className="mt-4 flex items-center gap-3">
                <Badge>{WALLET.plan}</Badge>
                <StatusDot status={status} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {status === "active"
                  ? `Your Pro plan renews on ${fmtDate(WALLET.renews)} for ${fmtMoney(WALLET.planPrice)}. Cancelling keeps access until the end of the period.`
                  : "Your subscription is cancelled. Copying is limited to one master until you reactivate."}
              </p>
              <div className="mt-6 flex gap-2">
                {status === "active" ? (
                  <Button
                    variant="outline"
                    className="text-destructive"
                    onClick={() => {
                      setStatus("cancelled");
                      toast.error("Subscription cancelled");
                    }}
                  >
                    Cancel subscription
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setStatus("active");
                      toast.success("Subscription reactivated");
                    }}
                  >
                    <RotateCcw className="mr-1 h-4 w-4" /> Reactivate subscription
                  </Button>
                )}
              </div>
            </div>

            <div className="panel p-6">
              <h3 className="font-display font-semibold">Payment method</h3>
              <div className="mt-4 flex items-center gap-3 rounded-md border border-border bg-surface-2 p-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <div className="num text-sm">Visa •••• 4242</div>
                  <div className="text-xs text-muted-foreground">Expires 09/28 · default</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-md border border-border bg-surface-2 p-4">
                <span className="grid h-5 w-5 place-items-center rounded-sm bg-long/20 text-[10px] text-long">M</span>
                <div>
                  <div className="num text-sm">M-Pesa •••• 0912</div>
                  <div className="text-xs text-muted-foreground">Mobile money · backup</div>
                </div>
              </div>
              <Button variant="outline" className="mt-5" onClick={() => toast.success("Payment method dialog opened")}>
                Add payment method
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="panel overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TRANSACTIONS.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="num text-xs">
                      <Link to="/payment-status" className="hover:text-primary">
                        {t.id}
                      </Link>
                    </TableCell>
                    <TableCell className="num text-xs text-muted-foreground">{fmtDate(t.date)}</TableCell>
                    <TableCell>{t.desc}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.method}</TableCell>
                    <TableCell className={cn("num text-right", t.amount >= 0 ? "text-long" : "")}>
                      {t.amount >= 0 ? "+" : "−"}
                      {fmtMoney(Math.abs(t.amount))}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusDot status={t.status} />
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
