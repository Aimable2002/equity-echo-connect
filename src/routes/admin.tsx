import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Eye, EyeOff, Star, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Avatar, PnL, Stat, StatusDot } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  ADMIN_KPIS,
  ADMIN_PAYOUTS,
  ADMIN_USERS,
  CHALLENGES,
  MASTERS,
  fmtDate,
  fmtMoney,
} from "@/lib/mock";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — payouts, users and challenges | CopyDesk" },
      {
        name: "description",
        content:
          "Platform KPIs, the pending master payout queue, user management, challenge program editing and directory moderation for CopyDesk operators.",
      },
      { property: "og:title", content: "Admin console — CopyDesk" },
      {
        property: "og:description",
        content: "Operate the relay: payouts, users, challenge programs and master moderation.",
      },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [payouts, setPayouts] = useState(
    ADMIN_PAYOUTS.map((p) => ({ ...p, status: p.status as "pending" | "approved" | "rejected" })),
  );
  const [dir, setDir] = useState(
    MASTERS.slice(0, 8).map((m, i) => ({
      id: m.id,
      name: m.name,
      platform: m.platform,
      pnl: m.return30d,
      followers: m.followers,
      approved: i !== 6,
      featured: i < 2,
      hidden: i === 7,
    })),
  );

  const decide = (id: string, status: "approved" | "rejected") => {
    setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    toast.success(`Payout ${id} ${status}`);
  };

  const pending = payouts.filter((p) => p.status === "pending");

  return (
    <AppShell
      title="Admin console"
      subtitle="Platform operations — restricted access"
      actions={<Badge variant="outline">Operator: root@copydesk.io</Badge>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ADMIN_KPIS.map((k) => (
          <Stat key={k.label} label={k.label} value={k.value} hint={k.delta} />
        ))}
      </div>

      <Tabs defaultValue="payouts" className="mt-8">
        <TabsList>
          <TabsTrigger value="payouts">Payouts ({pending.length})</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="directory">Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="mt-5">
          <div className="panel overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Master</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="num">{p.id}</TableCell>
                    <TableCell>{p.master}</TableCell>
                    <TableCell className="num">{fmtMoney(p.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{p.method}</TableCell>
                    <TableCell className="num text-muted-foreground">{fmtDate(p.requested)}</TableCell>
                    <TableCell>
                      <StatusDot status={p.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => decide(p.id, "approved")}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => decide(p.id, "rejected")}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Resolved</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-5">
          <div className="panel overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Accounts</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ADMIN_USERS.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="num">{u.id}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{u.role}</TableCell>
                    <TableCell className="num">{u.accounts}</TableCell>
                    <TableCell className="num text-muted-foreground">{fmtDate(u.joined)}</TableCell>
                    <TableCell>
                      <StatusDot status={u.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toast.success(
                            u.status === "suspended"
                              ? `${u.email} reinstated`
                              : `${u.email} suspended`,
                          )
                        }
                      >
                        {u.status === "suspended" ? "Reinstate" : "Suspend"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {CHALLENGES.map((c) => (
                <div key={c.id} className="panel p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="font-display font-semibold">{c.name}</div>
                    <Badge variant="outline" className="num">
                      {fmtMoney(c.accountSize)}
                    </Badge>
                    <span className="num ml-auto text-sm text-muted-foreground">
                      Fee {fmtMoney(c.fee)}
                    </span>
                    <Switch defaultChecked={c.active} />
                  </div>
                  <div className="num mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <Field k="Profit target" v={`${c.profitTarget}%`} />
                    <Field k="Max daily loss" v={`${c.maxDailyLoss}%`} />
                    <Field k="Max drawdown" v={`${c.maxDrawdown}%`} />
                    <Field k="Min days" v={String(c.minDays)} />
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">Reward: {c.reward}</p>
                </div>
              ))}
            </div>

            <form
              className="panel h-fit space-y-4 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Challenge program created");
              }}
            >
              <div className="font-display font-semibold">New program</div>
              <div className="space-y-1.5">
                <Label htmlFor="pn">Program name</Label>
                <Input id="pn" placeholder="Surge 10K" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="as">Account size</Label>
                  <Input id="as" className="num" placeholder="10000" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fe">Entry fee</Label>
                  <Input id="fe" className="num" placeholder="79" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pt">Profit target %</Label>
                  <Input id="pt" className="num" placeholder="8" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dd">Max drawdown %</Label>
                  <Input id="dd" className="num" placeholder="8" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rw">Reward</Label>
                <Input id="rw" placeholder="Funded master seat" />
              </div>
              <Button type="submit" className="w-full">
                Create program
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="directory" className="mt-5">
          <div className="space-y-3">
            {dir.map((m) => (
              <div key={m.id} className="panel flex flex-wrap items-center gap-4 p-4">
                <Avatar name={m.name} size={38} />
                <div className="min-w-40">
                  <div className="font-medium">{m.name}</div>
                  <div className="num text-xs text-muted-foreground">
                    {m.platform} · {m.followers} followers
                  </div>
                </div>
                <div className="num text-sm">
                  <PnL value={m.pnl} suffix="%" />
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  {!m.approved && <Badge variant="outline">Awaiting review</Badge>}
                  {m.featured && <Badge>Featured</Badge>}
                  {m.hidden && <Badge variant="destructive">Hidden</Badge>}
                  <Button
                    size="sm"
                    variant={m.approved ? "outline" : "default"}
                    onClick={() => {
                      setDir((p) =>
                        p.map((x) => (x.id === m.id ? { ...x, approved: !x.approved } : x)),
                      );
                      toast.success(m.approved ? "Approval revoked" : `${m.name} approved`);
                    }}
                  >
                    {m.approved ? "Revoke" : "Approve"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setDir((p) =>
                        p.map((x) => (x.id === m.id ? { ...x, featured: !x.featured } : x)),
                      )
                    }
                  >
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setDir((p) => p.map((x) => (x.id === m.id ? { ...x, hidden: !x.hidden } : x)))
                    }
                  >
                    {m.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mt-0.5">{v}</div>
    </div>
  );
}
