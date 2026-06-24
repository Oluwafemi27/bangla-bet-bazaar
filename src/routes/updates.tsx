import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/updates")({
  head: () => ({ meta: [{ title: "আপডেট — বাজি কিং" }] }),
  component: Updates,
});

function Updates() {
  const { data: items } = useQuery({
    queryKey: ["feature-updates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("feature_updates")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-gold" />
          <h1 className="text-2xl font-display">ফিচার আপডেট</h1>
        </div>
        {(items?.length ?? 0) === 0 ? (
          <div className="rounded-xl bg-card border border-border p-8 text-center text-muted-foreground">
            কোনো আপডেট নেই।
          </div>
        ) : (
          <ul className="space-y-3">
            {items!.map((u: any) => (
              <li key={u.id} className="rounded-xl bg-card-gradient border border-border p-4">
                {u.image_url && <img src={u.image_url} alt="" className="w-full max-h-64 object-cover rounded-md mb-3" />}
                <div className="font-display text-xl gold-text">{u.title_bn}</div>
                <p className="text-sm text-muted-foreground mt-1">{new Date(u.created_at).toLocaleString("bn-BD")}</p>
                <p className="text-sm mt-2 whitespace-pre-wrap">{u.body_bn}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
