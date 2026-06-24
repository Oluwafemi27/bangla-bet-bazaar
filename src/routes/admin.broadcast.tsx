import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminGate } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Megaphone, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/broadcast")({
  head: () => ({ meta: [{ title: "ব্রডকাস্ট — অ্যাডমিন" }] }),
  component: AdminBroadcast,
});

function AdminBroadcast() {
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");

  const { data: items } = useQuery({
    queryKey: ["broadcasts"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").is("user_id", null).order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const send = async () => {
    if (!msg.trim()) return;
    const { error } = await supabase.from("notifications").insert({ message_bn: msg, user_id: null });
    if (error) return toast.error(error.message);
    toast.success("সবাইকে পাঠানো হয়েছে");
    setMsg("");
    qc.invalidateQueries({ queryKey: ["broadcasts"] });
  };

  const del = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["broadcasts"] });
  };

  return (
    <AdminGate>
      <h1 className="text-2xl font-display mb-4 flex items-center gap-2"><Megaphone className="w-6 h-6 text-gold" /> ব্রডকাস্ট মেসেজ</h1>
      <div className="rounded-xl bg-card-gradient border border-border p-4 max-w-2xl">
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={4}
          placeholder="সব ব্যবহারকারীকে পাঠানোর জন্য মেসেজ লিখুন..."
          className="w-full rounded-md bg-background border border-border p-3 text-sm"
        />
        <button onClick={send} className="mt-3 rounded-md bg-gold-gradient text-gold-foreground font-bold px-5 py-2 glow-gold">
          সবাইকে পাঠান
        </button>
      </div>

      <h2 className="text-lg font-display mt-8 mb-3">পূর্ববর্তী ব্রডকাস্ট</h2>
      <ul className="space-y-2 max-w-2xl">
        {(items ?? []).map((n: any) => (
          <li key={n.id} className="rounded-xl bg-card border border-border p-3 flex justify-between gap-3">
            <div>
              <p className="text-sm">{n.message_bn}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("bn-BD")}</p>
            </div>
            <button onClick={() => del(n.id)} className="text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
          </li>
        ))}
        {(items?.length ?? 0) === 0 && <li className="text-sm text-muted-foreground">কোনো ব্রডকাস্ট নেই</li>}
      </ul>
    </AdminGate>
  );
}
