import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminGate } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/updates")({
  head: () => ({ meta: [{ title: "ফিচার আপডেট — অ্যাডমিন" }] }),
  component: AdminUpdates,
});

function AdminUpdates() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title_bn: "", body_bn: "", image_url: "" });

  const { data } = useQuery({
    queryKey: ["admin-updates"],
    queryFn: async () => (await supabase.from("feature_updates").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const add = async () => {
    if (!form.title_bn || !form.body_bn) return toast.error("শিরোনাম ও বিবরণ লাগবে");
    const { error } = await supabase.from("feature_updates").insert(form);
    if (error) return toast.error(error.message);
    toast.success("পোস্ট হয়েছে");
    setForm({ title_bn: "", body_bn: "", image_url: "" });
    qc.invalidateQueries({ queryKey: ["admin-updates"] });
  };

  const toggle = async (id: string, v: boolean) => {
    await supabase.from("feature_updates").update({ is_published: !v }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-updates"] });
  };

  const del = async (id: string) => {
    if (!confirm("মুছবেন?")) return;
    await supabase.from("feature_updates").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-updates"] });
  };

  return (
    <AdminGate>
      <h1 className="text-2xl font-display mb-4 flex items-center gap-2"><Sparkles className="w-6 h-6 text-gold" /> ফিচার আপডেট</h1>

      <div className="rounded-xl bg-card-gradient border border-border p-4 max-w-2xl space-y-2 mb-6">
        <input className="w-full rounded-md bg-background border border-border h-10 px-3 text-sm" placeholder="শিরোনাম" value={form.title_bn} onChange={(e) => setForm({ ...form, title_bn: e.target.value })} />
        <textarea className="w-full rounded-md bg-background border border-border p-3 text-sm" rows={4} placeholder="বিবরণ" value={form.body_bn} onChange={(e) => setForm({ ...form, body_bn: e.target.value })} />
        <input className="w-full rounded-md bg-background border border-border h-10 px-3 text-sm" placeholder="ইমেজ URL (ঐচ্ছিক)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <button onClick={add} className="rounded-md bg-gold-gradient text-gold-foreground font-bold px-5 py-2">পোস্ট করুন</button>
      </div>

      <ul className="space-y-2 max-w-2xl">
        {(data ?? []).map((u: any) => (
          <li key={u.id} className="rounded-xl bg-card border border-border p-3">
            <div className="flex justify-between gap-3">
              <div className="flex-1">
                <div className="font-display gold-text">{u.title_bn}</div>
                <p className="text-sm text-muted-foreground mt-1">{u.body_bn}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(u.created_at).toLocaleString("bn-BD")}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button onClick={() => toggle(u.id, u.is_published)} className={"text-xs rounded-md px-2 py-1 " + (u.is_published ? "bg-success/20 text-success" : "bg-muted text-muted-foreground")}>
                  {u.is_published ? "প্রকাশিত" : "ড্রাফট"}
                </button>
                <button onClick={() => del(u.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </li>
        ))}
        {(data?.length ?? 0) === 0 && <li className="text-sm text-muted-foreground">কিছু নেই</li>}
      </ul>
    </AdminGate>
  );
}
