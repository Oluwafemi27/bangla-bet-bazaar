import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Gift } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/promotions")({
  head: () => ({ meta: [{ title: "প্রমোশন ও বোনাস — বাজি কিং" }] }),
  component: Promotions,
});

function Promotions() {
  const { data: promos } = useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      const { data } = await supabase.from("promotions").select("*").eq("is_active", true).order("created_at");
      return data ?? [];
    },
  });

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-gold" />
          <h1 className="text-2xl font-display">প্রমোশন ও বোনাস</h1>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {(promos ?? []).map((p: any) => (
            <div key={p.id} className="rounded-xl border gold-border bg-card-gradient p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="inline-block rounded-full bg-gold/15 text-gold text-xs font-bold px-2 py-0.5 mb-2">
                  {p.type === "percent" ? `${p.value}%` : `৳${p.value}`}
                </div>
                <h3 className="font-display text-xl">{p.title_bn}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.description_bn}</p>
                {p.terms_bn && <p className="text-xs text-muted-foreground mt-2">শর্তাবলী: {p.terms_bn}</p>}
                <button onClick={() => toast.success("বোনাস ক্লেইম রেকর্ড করা হয়েছে — অ্যাডমিন অনুমোদন প্রয়োজন")}
                  className="mt-4 rounded-md bg-gold-gradient px-4 py-2 font-bold text-gold-foreground">
                  দাবি করুন
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
