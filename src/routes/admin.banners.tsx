import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminGate } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Image as ImageIcon, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({ meta: [{ title: "ব্যানার — অ্যাডমিন" }] }),
  component: AdminBanners,
});

function AdminBanners() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ image_url: "", title_bn: "", link_url: "", sort_order: 0 });

  const { data } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => (await supabase.from("banners").select("*").order("sort_order")).data ?? [],
  });

  const add = async () => {
    if (!form.image_url) return toast.error("ইমেজ URL লাগবে");
    const { error } = await supabase.from("banners").insert(form);
    if (error) return toast.error(error.message);
    toast.success("যোগ করা হয়েছে");
    setForm({ image_url: "", title_bn: "", link_url: "", sort_order: 0 });
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };

  const toggle = async (id: string, v: boolean) => {
    await supabase.from("banners").update({ is_active: !v }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };

  const del = async (id: string) => {
    if (!confirm("মুছবেন?")) return;
    await supabase.from("banners").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };

  return (
    <AdminGate>
      <h1 className="text-2xl font-display mb-4 flex items-center gap-2"><ImageIcon className="w-6 h-6 text-gold" /> স্লাইডশো ব্যানার</h1>

      <div className="rounded-xl bg-card-gradient border border-border p-4 max-w-2xl space-y-2 mb-6">
        <input className="w-full rounded-md bg-background border border-border h-10 px-3 text-sm" placeholder="ইমেজ URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <input className="w-full rounded-md bg-background border border-border h-10 px-3 text-sm" placeholder="শিরোনাম (বাংলা)" value={form.title_bn} onChange={(e) => setForm({ ...form, title_bn: e.target.value })} />
        <input className="w-full rounded-md bg-background border border-border h-10 px-3 text-sm" placeholder="লিংক URL (ঐচ্ছিক)" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
        <input type="number" className="w-32 rounded-md bg-background border border-border h-10 px-3 text-sm" placeholder="ক্রম" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        <button onClick={add} className="rounded-md bg-gold-gradient text-gold-foreground font-bold px-5 py-2">যোগ করুন</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(data ?? []).map((b: any) => (
          <div key={b.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <img src={b.image_url} alt="" className="w-full h-32 object-cover" />
            <div className="p-3">
              <div className="font-semibold">{b.title_bn ?? "—"}</div>
              <div className="text-xs text-muted-foreground">ক্রম: {b.sort_order}</div>
              <div className="flex justify-between mt-2">
                <button onClick={() => toggle(b.id, b.is_active)} className={"text-xs rounded-md px-2 py-1 " + (b.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground")}>
                  {b.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </button>
                <button onClick={() => del(b.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminGate>
  );
}
