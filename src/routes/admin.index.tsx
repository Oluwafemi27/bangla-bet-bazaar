import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminGate } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { Users, ArrowDownUp, Megaphone, Image, Sparkles, MessageSquare } from "lucide-react";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "অ্যাডমিন ড্যাশবোর্ড" }] }),
  component: AdminHome,
});

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-xl bg-card-gradient border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={"text-2xl font-display mt-1 " + (accent ?? "")}>{value}</div>
    </div>
  );
}

function AdminHome() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, pendingTx, openBets, totalDeposits] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("transactions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("bets").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("transactions").select("amount").eq("type", "deposit").eq("status", "approved"),
      ]);
      const sum = (totalDeposits.data ?? []).reduce((a, r: any) => a + Number(r.amount || 0), 0);
      return {
        users: users.count ?? 0,
        pendingTx: pendingTx.count ?? 0,
        openBets: openBets.count ?? 0,
        deposits: sum,
      };
    },
  });

  const quick = [
    { to: "/admin/users", label: "ব্যবহারকারী", icon: Users },
    { to: "/admin/transactions", label: "লেনদেন অনুমোদন", icon: ArrowDownUp },
    { to: "/admin/broadcast", label: "ব্রডকাস্ট", icon: Megaphone },
    { to: "/admin/messages", label: "ডাইরেক্ট মেসেজ", icon: MessageSquare },
    { to: "/admin/banners", label: "ব্যানার", icon: Image },
    { to: "/admin/updates", label: "ফিচার আপডেট", icon: Sparkles },
  ];

  return (
    <AdminGate>
      <h1 className="text-2xl font-display mb-4">ড্যাশবোর্ড</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="মোট ব্যবহারকারী" value={stats?.users ?? "—"} accent="gold-text" />
        <Stat label="পেন্ডিং লেনদেন" value={stats?.pendingTx ?? "—"} accent="text-warning" />
        <Stat label="ওপেন বেট" value={stats?.openBets ?? "—"} />
        <Stat label="মোট জমা" value={bdt(stats?.deposits ?? 0)} accent="text-success" />
      </div>
      <h2 className="text-lg font-display mt-8 mb-3">দ্রুত অ্যাকশন</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="rounded-xl bg-card-gradient border border-border p-4 hover:gold-border transition flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gold/10 gold-border flex items-center justify-center">
              <q.icon className="w-5 h-5 text-gold" />
            </div>
            <div className="font-semibold">{q.label}</div>
          </Link>
        ))}
      </div>
    </AdminGate>
  );
}
