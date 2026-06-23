import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Spade } from "lucide-react";

export const Route = createFileRoute("/casino")({
  head: () => ({ meta: [{ title: "ক্যাসিনো গেমস — বাজি কিং" }] }),
  component: Casino,
});

const emoji: Record<string, string> = {
  baccarat: "🎴", roulette: "🎯", teen_patti: "🃏", andar_bahar: "♠️", dragon_tiger: "🐉",
};

function Casino() {
  const [active, setActive] = useState<any>(null);
  const [chip, setChip] = useState(100);

  const { data: games } = useQuery({
    queryKey: ["casino-games"],
    queryFn: async () => {
      const { data } = await supabase.from("games").select("*").eq("is_active", true).order("name_bn");
      return data ?? [];
    },
  });

  if (active) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button onClick={() => setActive(null)} className="text-sm text-muted-foreground mb-3">← ফিরে যান</button>
          <div className="rounded-xl bg-card-gradient gold-border p-4">
            <h1 className="font-display text-2xl">{active.name_bn}</h1>
            <div className="aspect-video mt-4 rounded-lg bg-secondary/40 border border-border flex items-center justify-center text-7xl">
              {emoji[active.type] ?? "🎰"}
            </div>
            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-2">চিপ বাছাই করুন</div>
              <div className="flex flex-wrap gap-2">
                {[10, 50, 100, 500, 1000].map((c) => (
                  <button
                    key={c}
                    onClick={() => setChip(c)}
                    className={`px-4 py-2 rounded-full text-sm font-bold ${chip === c ? "bg-gold-gradient text-gold-foreground glow-gold" : "bg-secondary border border-border"}`}
                  >৳{c}</button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                লাইভ ক্যাসিনো প্রোভাইডার শীঘ্রই যুক্ত করা হবে। বর্তমানে এটি ডেমো ভিউ।
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Spade className="w-5 h-5 text-gold" />
          <h1 className="text-2xl font-display">ক্যাসিনো লবি</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(games ?? []).map((g: any) => (
            <button
              key={g.id}
              onClick={() => setActive(g)}
              className="group text-left rounded-xl border border-border/60 bg-card-gradient p-4 hover:gold-border hover:glow-gold transition"
            >
              <div className="aspect-square rounded-lg bg-secondary/40 flex items-center justify-center text-6xl mb-3">
                {emoji[g.type] ?? "🎰"}
              </div>
              <div className="font-display text-lg">{g.name_bn}</div>
              <div className="mt-2 inline-flex items-center text-xs font-bold text-gold">খেলুন →</div>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
