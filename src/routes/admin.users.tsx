import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminGate } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { bdt } from "@/lib/format";
import { toast } from "sonner";
import { Ban, CheckCircle2, Search } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "ব্যবহারকারী — অ্যাডমিন" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data: users } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async () => {
      let req = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
      if (q) req = req.or(`name.ilike.%${q}%,mobile.ilike.%${q}%,referral_code.ilike.%${q}%`);
      const { data } = await req;
      return data ?? [];
    },
  });

  const toggleBan = async (id: string, status: string) => {
    const next = status === "banned" ? "active" : "banned";
    const { error } = await supabase.from("profiles").update({ status: next }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(next === "banned" ? "ব্যান করা হয়েছে" : "আনব্যান করা হয়েছে");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const adjustBalance = async (id: string, current: number) => {
    const input = prompt("নতুন ব্যালেন্স (BDT):", String(current));
    if (input === null) return;
    const value = Number(input);
    if (Number.isNaN(value)) return toast.error("সংখ্যা দিন");
    const { error } = await supabase.from("profiles").update({ balance: value }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("ব্যালেন্স আপডেট হয়েছে");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  return (
    <AdminGate>
      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-2xl font-display">ব্যবহারকারী</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="নাম / মোবাইল / কোড"
            className="pl-8 pr-3 h-9 rounded-md bg-card border border-border text-sm w-64"
          />
        </div>
      </div>
      <div className="rounded-xl border border-border overflow-x-auto bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-muted-foreground text-left">
            <tr>
              <th className="px-3 py-2">নাম</th>
              <th className="px-3 py-2">মোবাইল</th>
              <th className="px-3 py-2">ব্যালেন্স</th>
              <th className="px-3 py-2">স্ট্যাটাস</th>
              <th className="px-3 py-2">KYC</th>
              <th className="px-3 py-2">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u: any) => (
              <tr key={u.id} className="border-t border-border/40">
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2">{u.mobile ?? "—"}</td>
                <td className="px-3 py-2 gold-text font-semibold">{bdt(u.balance)}</td>
                <td className="px-3 py-2">
                  <span className={"text-xs rounded-full px-2 py-0.5 " + (u.status === "banned" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success")}>
                    {u.status === "banned" ? "ব্যান" : "সক্রিয়"}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs">{u.kyc_status}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={() => toggleBan(u.id, u.status)} className="text-xs rounded-md border border-border px-2 py-1 hover:bg-secondary inline-flex items-center gap-1">
                    {u.status === "banned" ? <><CheckCircle2 className="w-3 h-3" /> আনব্যান</> : <><Ban className="w-3 h-3" /> ব্যান</>}
                  </button>
                  <button onClick={() => adjustBalance(u.id, u.balance)} className="text-xs rounded-md gold-border px-2 py-1 text-gold">ব্যালেন্স</button>
                </td>
              </tr>
            ))}
            {(users?.length ?? 0) === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">কোনো ব্যবহারকারী নেই</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminGate>
  );
}
