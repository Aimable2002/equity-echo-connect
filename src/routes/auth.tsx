import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create your desk — CopyDesk" },
      {
        name: "description",
        content:
          "Access your CopyDesk account to manage copied accounts, master profiles and payouts, or create a new account in under a minute.",
      },
      { property: "og:title", content: "Sign in or create your desk — CopyDesk" },
      {
        property: "og:description",
        content: "Sign in to CopyDesk to manage copy-trading accounts across MT5 and cTrader.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const routeAfterAuth = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return navigate({ to: "/auth" });
    const { data } = await supabase
      .from("accounts")
      .select("account_id")
      .eq("user_id", auth.user.id)
      .limit(1);
    navigate({ to: data && data.length ? "/dashboard" : "/onboarding" });
  };

  const submit = (kind: "in" | "up") => async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      if (kind === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your inbox to confirm your email, then sign in.");
          return;
        }
        toast.success("Desk created");
      }
      await routeAfterAuth();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between border-r border-border bg-surface/40 p-12 lg:flex">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />
        <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
        <Logo className="relative" />
        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight">
            Your broker. Your capital. <span className="brand-gradient-text">Their edge.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Live accounts mirroring verified fills from masters trading their own capital.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Trading credentials only — no withdrawal rights, ever.
          </div>
        </div>
        <p className="relative text-xs text-muted-foreground">
          Your capital stays at your own broker. CopyDesk never holds funds.
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Tabs defaultValue="signin" className="mt-8 lg:mt-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-8">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Pick up where your relay left off.
              </p>
              <form className="mt-7 space-y-4" onSubmit={submit("in")}>
                <Field id="si-email" name="email" label="Email" icon={Mail} type="email" placeholder="you@desk.com" autoComplete="email" />
                <Field id="si-pass" name="password" label="Password" icon={Lock} type="password" placeholder="••••••••" autoComplete="current-password" />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={async () => {
                      const email = window.prompt("Email to send a reset link to?")?.trim();
                      if (!email) return;
                      const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/settings`,
                      });
                      if (error) toast.error(error.message);
                      else toast.success("Reset link sent");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-8">
              <h1 className="text-2xl font-bold">Create your desk</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Free tier, one master, no card required.
              </p>
              <form className="mt-7 space-y-4" onSubmit={submit("up")}>
                <Field id="su-name" name="full_name" label="Full name" icon={User} placeholder="Jonah Mwangi" />
                <Field id="su-email" name="email" label="Email" icon={Mail} type="email" placeholder="you@desk.com" autoComplete="email" />
                <Field id="su-pass" name="password" label="Password" icon={Lock} type="password" placeholder="At least 8 characters" autoComplete="new-password" minLength={8} />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating…" : "Create account"} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  By continuing you accept the risk disclosure and terms.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Back to copydesk.io
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string; icon: React.ElementType }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} className="pl-9" {...props} />
      </div>
    </div>
  );
}
