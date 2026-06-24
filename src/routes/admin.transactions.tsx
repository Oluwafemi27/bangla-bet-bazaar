import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminGate } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { bdt } from "@/lib/format";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({ meta: [{ title: "লেনদেন — অ্যাডমিন" }] }),
  component: AdminTx,
});

function AdminTx() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  const { data: txs } = useQuery({
    queryKey: ["admin-txs", filter],
    queryFn: async () => {
      let req = supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(200);
      if (filter !== "all") req = req.eq("status", filter);
      const { data } = await req;
      return data ?? [];
    },
  });

  const decide = async (tx: any, status: "approved" | "rejected") => {
    const note = status === "rejected" ? prompt("প্রত্যাখ্যানের কারণ?") ?? "" : null;
    const { error } = await supabase.from("transactions").update({ status, admin_note: note }).eq("id", tx.id);
    if (error) return toast.error(error.message);

    if (status === "approved") {
      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", tx.user_id).single();
      const cur = Number(profile?.balance ?? 0);
      const delta = tx.type === "deposit" ? Number(tx.amount) : -Number(tx.amount);
      await supabase.from("profiles").update({ balance: cur + delta }).eq("id", tx.user_id);
      await supabase.from("notifications").insert({ user_id: tx.user_id, message_bn: `আপনার ${tx.type === "deposit" ? "জমা" : "উত্তোলন"} ${bdt(tx.amount)} অনুমোদিত হয়েছে।` });
    } else {
      await supabase.from("notifications").insert({ user_id: tx.user_id, message_bn: `আপনার ${tx.type === "deposit" ? "জমা" : "উত্তোলন"} প্রত্যাখ্যাত। কারণ: ${note ?? "—"}` });
    }
    toast.success("আপডেট হয়েছে");
    qc.invalidateQueries({ queryKey: ["admin-txs"] });
  };

  return (
    <AdminGate>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h1 className="text-2xl font-display">লেনদেন</h1>
        <div className="flex gap-1 text-xs">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={"px-3 py-1.5 rounded-md border " + (filter === f ? "bg-gold/10 gold-border text-gold" : "border-border text-muted-foreground")}>
              {f === "pending" ? "পেন্ডিং" : f === "approved" ? "অনুমোদিত" : f === "rejected" ? "প্রত্যাখ্যাত" : "সব"}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border overflow-x-auto bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-muted-foreground text-left">
            <tr>
              <th className="px-3 py-2">তারিখ</th>
              <th className="px-3 py-2">ধরন</th>
              <th className="px-3 py-2">পদ্ধতি</th>
              <th className="px-3 py-2">অ্যাকাউন্ট</th>
              <th className="px-3 py-2">রেফ</th>
              <th className="px-3 py-2 text-right">পরিমাণ</th>
              <th className="px-3 py-2">স্ট্যাটাস</th>
              <th className="px-3 py-2">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {(txs ?? []).map((t: any) => (
              <tr key={t.id} className="border-t border-border/40">
                <td className="px-3 py-2 text-xs">{new Date(t.created_at).toLocaleString("bn-BD")}</td>
                <td className="px-3 py-2">{t.type === "deposit" ? "জমা" : "উত্তোলন"}</td>
                <td className="px-3 py-2">{t.method ?? "—"}</td>
                <td className="px-3 py-2">{t.account_number ?? "—"}</td>
                <td className="px-3 py-2 text-xs">{t.reference ?? "—"}</td>
                <td className="px-3 py-2 text-right gold-text font-semibold">{bdt(t.amount)}</td>
                <td className="px-3 py-2">
                  <span className={"text-xs rounded-full px-2 py-0.5 " + (t.status === "approved" ? "bg-success/20 text-success" : t.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning")}>
                    {t.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {t.status === "pending" && (
                    <div className="flex gap-1">
                      <button onClick={() => decide(t, "approved")} className="text-xs rounded-md bg-success/20 text-success px-2 py-1">অনুমোদন</button>
                      <button onClick={() => decide(t, "rejected")} className="text-xs rounded-md bg-destructive/20 text-destructive px-2 py-1">প্রত্যাখ্যান</button>
                    </div>
                  )}
                  {t.screenshot_url && <a href={t.screenshot_url} target="_blank" rel="noreferrer" className="text-xs text-gold underline ml-1">প্রমাণ</a>}
                </td>
              </tr>
            ))}
            {(txs?.length ?? 0) === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">কিছু নেই</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminGate>
  );
}
