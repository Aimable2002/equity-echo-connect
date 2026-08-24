import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, CreditCard, Lock, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fmtMoney } from "@/lib/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — pay by card, mobile money or bank | CopyDesk" },
      {
        name: "description",
        content:
          "Complete your CopyDesk payment by card, mobile money or bank transfer, with the total converted into your local currency before you confirm.",
      },
      { property: "og:title", content: "Checkout — CopyDesk" },
      {
        property: "og:description",
        content: "Pay by card, mobile money or bank transfer with transparent local-currency conversion.",
      },
    ],
  }),
  component: Checkout,
});

const CURRENCIES = [
  { code: "KES", label: "Kenyan shilling", rate: 129.4 },
  { code: "NGN", label: "Nigerian naira", rate: 1580 },
  { code: "GHS", label: "Ghanaian cedi", rate: 15.2 },
  { code: "ZAR", label: "South African rand", rate: 18.1 },
  { code: "USD", label: "US dollar", rate: 1 },
];

function Checkout() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"card" | "momo" | "bank">("card");
  const [ccy, setCcy] = useState("KES");
  const [busy, setBusy] = useState(false);

  const subtotal = 49;
  const fee = method === "card" ? 1.47 : method === "momo" ? 0.98 : 0;
  const total = subtotal + fee;
  const cur = CURRENCIES.find((c) => c.code === ccy) ?? CURRENCIES[0]!;
  const local = total * cur.rate;

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success("Payment submitted — reference CD-91847");
      navigate({ to: "/payment-status" });
    }, 900);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Secure checkout
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-12 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={pay}>
          <h1 className="text-2xl font-bold">Payment method</h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { id: "card" as const, icon: CreditCard, t: "Card", d: "Visa / Mastercard" },
              { id: "momo" as const, icon: Smartphone, t: "Mobile money", d: "M-Pesa, MoMo, Airtel" },
              { id: "bank" as const, icon: Building2, t: "Bank transfer", d: "1–2 business days" },
            ].map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  method === m.id ? "border-primary bg-surface-2" : "border-border bg-surface",
                )}
              >
                <m.icon className="h-4 w-4 text-primary" />
                <div className="mt-3 text-sm font-medium">{m.t}</div>
                <div className="text-xs text-muted-foreground">{m.d}</div>
              </button>
            ))}
          </div>

          <div className="panel mt-6 space-y-4 p-6">
            {method === "card" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="cn">Card number</Label>
                  <Input id="cn" className="num" placeholder="4242 4242 4242 4242" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="ex">Expiry</Label>
                    <Input id="ex" className="num" placeholder="09/28" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cv">CVC</Label>
                    <Input id="cv" className="num" placeholder="123" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nm">Name on card</Label>
                  <Input id="nm" placeholder="Jonah Mwangi" />
                </div>
              </>
            )}

            {method === "momo" && (
              <>
                <div className="space-y-1.5">
                  <Label>Provider</Label>
                  <Select defaultValue="mpesa">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa (Safaricom)</SelectItem>
                      <SelectItem value="momo">MTN MoMo</SelectItem>
                      <SelectItem value="airtel">Airtel Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ph">Mobile number</Label>
                  <Input id="ph" className="num" placeholder="+254 7XX XXX XXX" />
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll receive an STK push to authorise {local.toLocaleString("en-US", { maximumFractionDigits: 0 })} {cur.code}.
                </p>
              </>
            )}

            {method === "bank" && (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Transfer the total to the account below and quote your reference. Funds clear in
                  1–2 business days.
                </p>
                <dl className="num space-y-2 rounded-md border border-border bg-surface-2 p-4">
                  <Row k="Bank" v="Stanbic Bank" />
                  <Row k="Account name" v="CopyDesk Technologies Ltd" />
                  <Row k="Account number" v="0100 4471 2290" />
                  <Row k="SWIFT" v="SBICKENX" />
                  <Row k="Reference" v="CD-91847" />
                </dl>
              </div>
            )}
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
            {busy ? "Processing…" : `Pay ${fmtMoney(total)}`}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Demo checkout — no real payment is taken.
          </p>
        </form>

        <aside className="panel h-fit p-6">
          <h2 className="font-display font-semibold">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">CopyDesk Pro — monthly</span>
              <span className="num">{fmtMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processing fee</span>
              <span className="num">{fmtMoney(fee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Total</span>
              <span className="num">{fmtMoney(total)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-1.5">
            <Label>Charge in</Label>
            <Select value={ccy} onValueChange={setCcy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} — {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 rounded-md border border-border bg-surface-2 p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              You will be charged
            </div>
            <div className="num mt-1 text-2xl font-semibold text-primary">
              {local.toLocaleString("en-US", { maximumFractionDigits: 2 })} {cur.code}
            </div>
            <div className="num mt-1 text-xs text-muted-foreground">
              1 USD = {cur.rate} {cur.code}
            </div>
          </div>

          <Badge variant="outline" className="mt-5 w-full justify-center py-1.5 text-[11px]">
            Cancel any time · no lock-in
          </Badge>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/wallet" className="hover:text-foreground">
              ← Back to billing
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
