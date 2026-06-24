import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminGate } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/messages")({
  head: () => ({ meta: [{ title: "ডাইরেক্ট মেসেজ — অ্যাডমিন" }] }),
  component: AdminMessages,
});

function AdminMessages() {
  const qc = useQueryClient();
  const [target, setTarget] = useState("");
  const [msg, setMsg] = useState("");

  const { data: users } = useQuery({
    queryKey: ["admin-msg-users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id,name,mobile").order("created_at", { ascending: false }).limit(500);
      return data ?? [];
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin-dms"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").not("user_id", "is", null).order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const send = async () => {
    if (!target || !msg.trim()) return toast.error("ব্যবহারকারী ও মেসেজ লাগবে");
    const { error } = await supabase.from("notifications").insert({ user_id: target, message_bn: msg });
    if (error) return toast.error(error.message);
    toast.success("মেসেজ পাঠানো হয়েছে");
    setMsg("");
    qc.invalidateQueries({ queryKey: ["admin-dms"] });
  };

  return (
    <AdminGate>
      <h1 className="text-2xl font-display mb-4 flex items-center gap-2"><MessageSquare className="w-6 h-6 text-gold" /> ডাইরেক্ট মেসেজ</h1>
      <div className="rounded-xl bg-card-gradient border border-border p-4 max-w-2xl space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">ব্যবহারকারী নির্বাচন করুন</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full mt-1 rounded-md bg-background border border-border h-10 px-2 text-sm">
            <option value="">— নির্বাচন করুন —</option>
            {(users ?? []).map((u: any) => (
              <option key={u.id} value={u.id}>{u.name} {u.mobile ? `(${u.mobile})` : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">মেসেজ</label>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} className="w-full mt-1 rounded-md bg-background border border-border p-3 text-sm" />
        </div>
        <button onClick={send} className="rounded-md bg-gold-gradient text-gold-foreground font-bold px-5 py-2 glow-gold">পাঠান</button>
      </div>

      <h2 className="text-lg font-display mt-8 mb-3">সাম্প্রতিক ডাইরেক্ট মেসেজ</h2>
      <ul className="space-y-2 max-w-2xl">
        {(recent ?? []).map((n: any) => {
          const u = users?.find((x: any) => x.id === n.user_id);
          return (
            <li key={n.id} className="rounded-xl bg-card border border-border p-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{u?.name ?? n.user_id.slice(0, 8)}</span>
                <span>{new Date(n.created_at).toLocaleString("bn-BD")}</span>
              </div>
              <p className="text-sm mt-1">{n.message_bn}</p>
            </li>
          );
        })}
        {(recent?.length ?? 0) === 0 && <li className="text-sm text-muted-foreground">কিছু নেই</li>}
      </ul>
    </AdminGate>
  );
}
