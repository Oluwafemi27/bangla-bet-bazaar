import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { bdt } from "@/lib/format";
import { Trophy, X } from "lucide-react";

export const Route = createFileRoute("/cricket")({
  head: () => ({ meta: [{ title: "ক্রিকেট বেটিং — বাজি কিং" }] }),
  component: Cricket,
});

type Selection = { label: string; odds: number };
type Pick = { matchId: string; matchLabel: string; market: string; selection: string; odds: number };

function Cricket() {
  const qc = useQueryClient();
  const { user, profile, refresh } = useAuth();
  const [pick, setPick] = useState<Pick | null>(null);
  const [amount, setAmount] = useState<number>(100);

  const { data: matches, isLoading } = useQuery({
    queryKey: ["cricket-matches"],
    queryFn: async () => {
      const { data } = await supabase
        .from("matches")
        .select("id,team_home,team_away,tournament,start_time,status,score_home,score_away,odds_markets(id,market_name,selections,is_active)")
        .order("start_time", { ascending: true });
      return data ?? [];
    },
  });

  const placeBet = async () => {
    if (!user) { toast.error("আগে লগইন করুন"); return; }
    if (!pick) return;
    if (amount < 10) { toast.error("সর্বনিম্ন বাজি ৳১০"); return; }
    const bal = Number(profile?.balance ?? 0);
    if (amount > bal) { toast.error("ব্যালেন্স পর্যাপ্ত নয়। জমা করুন।"); return; }

    const potential = +(amount * pick.odds).toFixed(2);
    const { error } = await supabase.from("bets").insert({
      user_id: user.id,
      game_type: "cricket",
      match_id: pick.matchId,
      market: pick.market,
      selection: pick.selection,
      odds: pick.odds,
      amount,
      potential_payout: potential,
      status: "pending",
    });
    if (error) { toast.error(error.message); return; }
    // deduct balance client-side (real settlement happens admin-side)
    await supabase.from("profiles").update({ balance: bal - amount }).eq("id", user.id);
    toast.success(`বাজি সফল! সম্ভাব্য পেআউট: ${bdt(potential)}`);
    setPick(null);
    refresh();
    qc.invalidateQueries({ queryKey: ["bet-history"] });
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_340px] gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-gold" />
            <h1 className="text-2xl font-display">ক্রিকেট ম্যাচসমূহ</h1>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-card animate-pulse" />)}</div>
          ) : (matches?.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              এই মুহূর্তে কোনো ম্যাচ নেই।
            </div>
          ) : (
            <div className="space-y-3">
              {matches!.map((m: any) => (
                <div key={m.id} className="rounded-xl bg-card-gradient border border-border/60 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{m.tournament}</span>
                    {m.status === "live" ? (
                      <span className="text-success font-bold">● লাইভ {m.score_home != null && `${m.score_home}–${m.score_away}`}</span>
                    ) : (
                      <span className="text-muted-foreground">{new Date(m.start_time).toLocaleString("bn-BD")}</span>
                    )}
                  </div>
                  <div className="mt-2 font-display text-lg">
                    {m.team_home} <span className="text-muted-foreground text-sm mx-1">বনাম</span> {m.team_away}
                  </div>
                  {(m.odds_markets ?? []).map((mk: any) => (
                    <div key={mk.id} className="mt-3">
                      <div className="text-xs text-muted-foreground mb-1.5">{mk.market_name}</div>
                      <div className="grid grid-cols-3 gap-2">
                        {(mk.selections as Selection[]).map((s, i) => {
                          const selected = pick?.matchId === m.id && pick?.selection === s.label && pick?.market === mk.market_name;
                          return (
                            <button
                              key={i}
                              onClick={() => setPick({ matchId: m.id, matchLabel: `${m.team_home} বনাম ${m.team_away}`, market: mk.market_name, selection: s.label, odds: s.odds })}
                              className={`rounded-md px-3 py-2.5 text-left transition ${selected ? "bg-gold-gradient text-gold-foreground" : "bg-secondary/60 border border-border/50 hover:gold-border"}`}
                            >
                              <div className="text-[11px] opacity-80 truncate">{s.label}</div>
                              <div className="font-bold">{s.odds}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bet slip */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="rounded-xl bg-card-gradient gold-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-gold">বেট স্লিপ</h3>
              {pick && <button onClick={() => setPick(null)}><X className="w-4 h-4" /></button>}
            </div>
            {!pick ? (
              <p className="text-sm text-muted-foreground">একটি অডস বাছাই করুন।</p>
            ) : (
              <div className="space-y-3">
                <div className="rounded-md bg-secondary/60 p-3">
                  <div className="text-xs text-muted-foreground">{pick.matchLabel}</div>
                  <div className="text-sm mt-1">{pick.market}: <span className="font-bold">{pick.selection}</span></div>
                  <div className="text-xs text-gold mt-1">অডস: {pick.odds}</div>
                </div>
                <label className="block">
                  <span className="text-xs text-muted-foreground">বাজির পরিমাণ (৳)</span>
                  <input
                    type="number"
                    min={10}
                    value={amount}
                    onChange={(e) => setAmount(+e.target.value)}
                    className="w-full mt-1 rounded-md bg-input border border-border px-3 py-2 text-sm"
                  />
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[100, 500, 1000, 5000].map((v) => (
                    <button key={v} onClick={() => setAmount(v)} className="rounded bg-secondary py-1.5 text-xs">৳{v}</button>
                  ))}
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border/40">
                  <span className="text-muted-foreground">সম্ভাব্য পেআউট</span>
                  <span className="font-bold text-success">{bdt(+(amount * pick.odds).toFixed(2))}</span>
                </div>
                <button onClick={placeBet} className="w-full rounded-md bg-gold-gradient py-2.5 font-bold text-gold-foreground glow-gold">
                  বাজি ধরুন
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
