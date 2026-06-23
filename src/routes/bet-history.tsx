import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/bet-history")({
  head: () => ({ meta: [{ title: "বেট ইতিহাস — বাজি কিং" }] }),
  component: BetHistory,
});

function BetHistory() {
  const { user } = useAuth();
  const { data: bets } = useQuery({
    queryKey: ["bet-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("bets").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (!user) return <AppShell><div className="max-w-md mx-auto p-8 text-center text-muted-foreground">আগে লগইন করুন।</div></AppShell>;

  const game: Record<string, string> = { cricket: "ক্রিকেট", aviator: "অ্যাভিয়েটর", baccarat: "ব্যাকারেট", roulette: "রুলেট" };
  const status: Record<string, string> = { pending: "অপেক্ষমান", won: "জিতেছেন", lost: "হেরেছেন", void: "বাতিল" };
  const color: Record<string, string> = { pending: "text-amber-400", won: "text-success", lost: "text-destructive", void: "text-muted-foreground" };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-display mb-4">বেট ইতিহাস</h1>
        {(bets?.length ?? 0) === 0 ? (
          <div className="rounded-xl bg-card border border-border p-8 text-center text-muted-foreground">কোনো বেট নেই।</div>
        ) : (
          <div className="rounded-xl bg-card border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs text-muted-foreground">
                <tr>
                  <th className="p-2.5 text-left">তারিখ</th><th className="p-2.5 text-left">গেম</th>
                  <th className="p-2.5 text-left">নির্বাচন</th><th className="p-2.5 text-right">অডস</th>
                  <th className="p-2.5 text-right">পরিমাণ</th><th className="p-2.5 text-right">পেআউট</th>
                  <th className="p-2.5 text-right">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {bets!.map((b: any) => (
                  <tr key={b.id} className="border-t border-border/40">
                    <td className="p-2.5 text-xs text-muted-foreground whitespace-nowrap">{new Date(b.created_at).toLocaleString("bn-BD")}</td>
                    <td className="p-2.5">{game[b.game_type] ?? b.game_type}</td>
                    <td className="p-2.5 text-xs">{b.selection ?? "—"}</td>
                    <td className="p-2.5 text-right">{b.odds}</td>
                    <td className="p-2.5 text-right">{bdt(b.amount)}</td>
                    <td className="p-2.5 text-right font-bold">{bdt(b.potential_payout)}</td>
                    <td className={`p-2.5 text-right font-semibold ${color[b.status]}`}>{status[b.status] ?? b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
