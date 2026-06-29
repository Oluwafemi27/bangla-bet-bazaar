import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { bdt } from "@/lib/format";
import { toast } from "sonner";
import {
  Trophy, Clock, X, ChevronDown, ChevronUp,
  ShoppingCart, Trash2, RefreshCw, Wifi, WifiOff, Shield
} from "lucide-react";

export const Route = createFileRoute("/cricket")({
  head: () => ({ meta: [{ title: "ক্রিকেট বেটিং — বাজি কিং" }] }),
  component: CricketPage,
});

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Selection { id: string; name: string; odds: number }
interface Market { id: string; match_id: string; market_name: string; selections: Selection[]; is_active: boolean }
interface Match {
  id: string; external_id: string | null;
  team_home: string; team_away: string;
  tournament: string | null; category: string | null;
  start_time: string; status: string;
  home_logo: string | null; away_logo: string | null; logo_url: string | null;
  markets?: Market[];
}
interface BetSlipItem {
  matchId: string; matchName: string;
  market: string; selection: string; odds: number; marketId: string
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = { upcoming: "আসন্ন", live: "লাইভ", finished: "শেষ" };
const TOURNAMENT_BN: Record<string, string> = {
  "t20-blast": "টি২০ ব্লাস্ট", "the-hundred": "দ্য হান্ড্রেড",
  "major-league-cricket": "মেজর লিগ ক্রিকেট",
  "caribbean-premier-league": "সিপিএল",
  "twenty20-1st-t20": "টি২০ ১ম ম্যাচ", "twenty20-2nd-t20": "টি২০ ২য় ম্যাচ",
  "twenty20-3rd-t20": "টি২০ ৩য় ম্যাচ", "twenty20-4th-t20": "টি২০ ৪র্থ ম্যাচ",
  "twenty20-5th-t20": "টি২০ ৫ম ম্যাচ",
  "odi-1st-odi": "ওডিআই ১ম ম্যাচ", "odi-2nd-odi": "ওডিআই ২য় ম্যাচ", "odi-3rd-odi": "ওডিআই ৩য় ম্যাচ",
  "test-match-1st-test": "টেস্ট ১ম", "test-match-2nd-test": "টেস্ট ২য়",
  "t20-maharaja-trophy": "মহারাজা ট্রফি", "premier-league-t20": "প্রিমিয়ার লিগ টি২০",
  "women-twenty20-icc-world-cup": "আইসিসি মহিলা টি২০ বিশ্বকাপ",
};
function tBn(slug: string | null) { return slug ? (TOURNAMENT_BN[slug] ?? slug.replace(/-/g, " ")) : "ক্রিকেট"; }

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("bn-BD", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function TeamLogo({ url, name }: { url: string | null; name: string }) {
  if (url) return <img src={url} alt={name} className="w-8 h-8 rounded-full object-cover bg-secondary" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />;
  return <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-gold">{name.charAt(0)}</div>;
}

/* ─── BetSlip ────────────────────────────────────────────────────────────── */
function BetSlip({ items, onRemove, onClear }: {
  items: BetSlipItem[]; onRemove: (key: string) => void; onClear: () => void
}) {
  const { user, profile, refresh } = useAuth();
  const [stake, setStake] = useState<string>("");
  const [open, setOpen] = useState(true);
  const qc = useQueryClient();

  const totalOdds = items.reduce((acc, i) => acc * i.odds, 1);
  const stakeNum = parseFloat(stake) || 0;
  const payout = +(stakeNum * totalOdds).toFixed(2);

  const placeBet = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("লগইন করুন");
      if (stakeNum < 10) throw new Error("ন্যূনতম বেট ১০ টাকা");
      if ((profile?.balance ?? 0) < stakeNum) throw new Error("পর্যাপ্ত ব্যালেন্স নেই");
      if (items.length === 0) throw new Error("বেটস্লিপ খালি");

      // For multi-bet: insert one bet per selection (parlay style)
      // For single: just one
      const betsToInsert = items.map((item) => ({
        user_id: user.id,
        game_type: "cricket",
        match_id: item.matchId,
        market: item.market,
        selection: item.selection,
        odds: item.odds,
        amount: stakeNum / items.length,
        potential_payout: payout,
        status: "pending",
      }));

      const { error: betErr } = await supabase.from("bets").insert(betsToInsert);
      if (betErr) throw betErr;

      // Deduct balance
      const { error: balErr } = await supabase
        .from("profiles")
        .update({ balance: (profile!.balance - stakeNum) })
        .eq("id", user.id);
      if (balErr) throw balErr;
    },
    onSuccess: async () => {
      toast.success(`বেট সফল! সম্ভাব্য পেআউট: ${bdt(payout)}`);
      setStake("");
      onClear();
      await refresh();
      qc.invalidateQueries({ queryKey: ["bet-history"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (items.length === 0) return null;

  const key = (i: BetSlipItem) => `${i.matchId}_${i.marketId}_${i.selection}`;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 z-50 w-80 rounded-2xl border border-gold/40 bg-card shadow-gold overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gold/10 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2 font-semibold text-gold text-sm">
          <ShoppingCart className="w-4 h-4" />
          বেটস্লিপ
          <span className="bg-gold text-gold-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{items.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {open && (
        <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
          {items.map((item) => (
            <div key={key(item)} className="flex items-start justify-between gap-2 rounded-lg bg-secondary/50 p-2.5 text-xs">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{item.selection}</div>
                <div className="text-muted-foreground truncate">{item.matchName}</div>
                <div className="text-muted-foreground">{item.market}</div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-gold font-bold">{item.odds.toFixed(2)}</span>
                <button onClick={() => onRemove(key(item))} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="p-3 border-t border-border/40 space-y-3">
          {items.length > 1 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">মোট অডস</span>
              <span className="text-gold font-bold">{totalOdds.toFixed(2)}</span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="number"
              min={10}
              placeholder="পরিমাণ (৳)"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="flex-1 rounded-lg bg-secondary border border-border/60 px-3 py-2 text-sm outline-none focus:border-gold/60"
            />
          </div>

          {/* Quick stakes */}
          <div className="flex gap-1.5 flex-wrap">
            {[50, 100, 200, 500].map((v) => (
              <button
                key={v}
                onClick={() => setStake(String(v))}
                className="px-2.5 py-1 rounded-md bg-secondary text-xs hover:bg-gold/20 hover:text-gold transition-colors"
              >
                {v}
              </button>
            ))}
          </div>

          {stakeNum > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">সম্ভাব্য পেআউট</span>
              <span className="text-success font-bold">{bdt(payout)}</span>
            </div>
          )}

          {!user ? (
            <Link to="/auth" className="block w-full rounded-xl bg-gold-gradient text-gold-foreground text-sm font-bold py-2.5 text-center glow-gold">
              লগইন করুন
            </Link>
          ) : (
            <button
              disabled={stakeNum < 10 || placeBet.isPending}
              onClick={() => placeBet.mutate()}
              className="w-full rounded-xl bg-gold-gradient text-gold-foreground text-sm font-bold py-2.5 glow-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {placeBet.isPending ? "প্রক্রিয়াধীন…" : `বেট করুন • ${bdt(stakeNum || 0)}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Match Card ──────────────────────────────────────────────────────────── */
function MatchCard({ match, onSelect, slipKeys }: {
  match: Match; onSelect: (item: BetSlipItem) => void; slipKeys: Set<string>
}) {
  const [expanded, setExpanded] = useState(false);
  const markets = match.markets ?? [];
  const primaryMarket = markets.find((m) =>
    /match winner|match result|winner|1x2/i.test(m.market_name)
  ) ?? markets[0];

  const isLive = match.status === "live";

  return (
    <div className={`rounded-2xl border ${isLive ? "border-neon/40 shadow-neon/20" : "border-border/50"} bg-card overflow-hidden transition-all`}>
      {/* Match header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs text-muted-foreground font-medium truncate">{tBn(match.tournament)}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {isLive ? (
              <span className="flex items-center gap-1 text-xs font-bold text-neon animate-pulse">
                <Wifi className="w-3 h-3" /> লাইভ
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" /> {fmtTime(match.start_time)}
              </span>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1 flex-1 text-center min-w-0">
            <TeamLogo url={match.home_logo} name={match.team_home} />
            <span className="text-xs font-semibold leading-tight truncate w-full">{match.team_home}</span>
          </div>
          <div className="text-xs font-bold text-muted-foreground shrink-0 bg-secondary rounded px-2 py-0.5">বনাম</div>
          <div className="flex flex-col items-center gap-1 flex-1 text-center min-w-0">
            <TeamLogo url={match.away_logo} name={match.team_away} />
            <span className="text-xs font-semibold leading-tight truncate w-full">{match.team_away}</span>
          </div>
        </div>
      </div>

      {/* Primary market quick buttons */}
      {primaryMarket && (
        <div className="px-3 pb-2">
          <div className="text-[10px] text-muted-foreground mb-1.5 font-medium">{primaryMarket.market_name}</div>
          <div className="flex gap-2">
            {primaryMarket.selections.slice(0, 3).map((sel) => {
              const k = `${match.id}_${primaryMarket.id}_${sel.name}`;
              const selected = slipKeys.has(k);
              return (
                <button
                  key={sel.id}
                  onClick={() => onSelect({
                    matchId: match.id, marketId: primaryMarket.id,
                    matchName: `${match.team_home} বনাম ${match.team_away}`,
                    market: primaryMarket.market_name,
                    selection: sel.name, odds: sel.odds,
                  })}
                  className={`flex-1 rounded-xl border py-2 px-1 text-center transition-all ${
                    selected
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-border/50 bg-secondary/40 hover:border-gold/40 hover:bg-gold/5"
                  }`}
                >
                  <div className="text-[10px] text-muted-foreground leading-tight truncate">{sel.name}</div>
                  <div className={`text-sm font-bold mt-0.5 ${selected ? "text-gold" : ""}`}>{sel.odds.toFixed(2)}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* More markets toggle */}
      {markets.length > 1 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-gold border-t border-border/30 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "কম দেখান" : `আরও ${markets.length - 1}টি মার্কেট`}
          </button>

          {expanded && (
            <div className="border-t border-border/30 px-3 py-2 space-y-3">
              {markets.slice(1).map((market) => (
                <div key={market.id}>
                  <div className="text-[10px] text-muted-foreground mb-1.5 font-medium">{market.market_name}</div>
                  <div className="flex flex-wrap gap-2">
                    {market.selections.map((sel) => {
                      const k = `${match.id}_${market.id}_${sel.name}`;
                      const selected = slipKeys.has(k);
                      return (
                        <button
                          key={sel.id}
                          onClick={() => onSelect({
                            matchId: match.id, marketId: market.id,
                            matchName: `${match.team_home} বনাম ${match.team_away}`,
                            market: market.market_name,
                            selection: sel.name, odds: sel.odds,
                          })}
                          className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs transition-all min-w-[100px] ${
                            selected
                              ? "border-gold bg-gold/15 text-gold"
                              : "border-border/50 bg-secondary/40 hover:border-gold/40"
                          }`}
                        >
                          <span className="truncate">{sel.name}</span>
                          <span className={`font-bold shrink-0 ${selected ? "text-gold" : ""}`}>{sel.odds.toFixed(2)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* No markets fallback */}
      {markets.length === 0 && (
        <div className="px-3 pb-3 text-xs text-muted-foreground text-center">
          অডস লোড হচ্ছে…
        </div>
      )}
    </div>
  );
}

/* ─── Filter tabs ─────────────────────────────────────────────────────────── */
const FILTERS = [
  { key: "all", label: "সব" },
  { key: "live", label: "লাইভ" },
  { key: "upcoming", label: "আসন্ন" },
  { key: "t20", label: "টি২০" },
  { key: "odi", label: "ওডিআই" },
  { key: "test", label: "টেস্ট" },
] as const;
type FilterKey = typeof FILTERS[number]["key"];

/* ─── Main Page ───────────────────────────────────────────────────────────── */
function CricketPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [slip, setSlip] = useState<BetSlipItem[]>([]);

  const slipKeys = new Set(
    slip.map((i) => `${i.matchId}_${i.marketId}_${i.selection}`)
  );

  const { data: matches, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["cricket-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          id, external_id, team_home, team_away, tournament, category,
          start_time, status, home_logo, away_logo, logo_url,
          markets:odds_markets(id, match_id, market_name, selections, is_active)
        `)
        .eq("sport", "cricket")
        .in("status", ["upcoming", "live"])
        .order("start_time", { ascending: true });

      if (error) throw error;
      return (data ?? []) as Match[];
    },
    refetchInterval: 60_000, // auto-refresh every 60s
  });

  const addToSlip = useCallback((item: BetSlipItem) => {
    const k = `${item.matchId}_${item.marketId}_${item.selection}`;
    setSlip((prev) => {
      if (prev.some((i) => `${i.matchId}_${i.marketId}_${i.selection}` === k)) {
        return prev.filter((i) => `${i.matchId}_${i.marketId}_${i.selection}` !== k);
      }
      // Only one selection per match allowed
      const withoutMatch = prev.filter((i) => !(i.matchId === item.matchId && i.marketId === item.marketId));
      return [...withoutMatch, item];
    });
  }, []);

  const removeFromSlip = useCallback((k: string) => {
    setSlip((prev) => prev.filter((i) => `${i.matchId}_${i.marketId}_${i.selection}` !== k));
  }, []);

  const filtered = (matches ?? []).filter((m) => {
    if (filter === "live") return m.status === "live";
    if (filter === "upcoming") return m.status === "upcoming";
    if (filter === "t20") return /twenty20|t20/i.test(m.tournament ?? "");
    if (filter === "odi") return /odi/i.test(m.tournament ?? "");
    if (filter === "test") return /test/i.test(m.tournament ?? "");
    return true;
  });

  const liveCount = (matches ?? []).filter((m) => m.status === "live").length;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-5 pb-40">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-gold" />
              ক্রিকেট বেটিং
            </h1>
            {liveCount > 0 && (
              <p className="text-xs text-neon mt-0.5 flex items-center gap-1">
                <Wifi className="w-3 h-3 animate-pulse" />
                {liveCount}টি ম্যাচ এখন লাইভ
              </p>
            )}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            রিফ্রেশ
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium transition-all border ${
                filter === f.key
                  ? "bg-gold/15 border-gold/50 text-gold"
                  : "border-border/40 text-muted-foreground hover:border-gold/30 hover:text-foreground"
              }`}
            >
              {f.label}
              {f.key === "live" && liveCount > 0 && (
                <span className="ml-1.5 bg-neon text-black text-[10px] font-bold rounded-full px-1.5 py-0.5">{liveCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Match list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/40 bg-card h-36 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card p-12 text-center">
            <WifiOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">কোনো ম্যাচ পাওয়া যায়নি।</p>
            <p className="text-xs text-muted-foreground mt-1">ম্যাচ সিঙ্ক হতে কিছুটা সময় লাগতে পারে।</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 rounded-lg bg-gold/10 border border-gold/30 text-gold text-sm hover:bg-gold/20 transition-all"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onSelect={addToSlip}
                slipKeys={slipKeys}
              />
            ))}
          </div>
        )}

        {/* Info note */}
        <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground rounded-xl bg-secondary/30 p-3 border border-border/30">
          <Shield className="w-4 h-4 shrink-0 mt-0.5 text-gold/60" />
          <span>অডস প্রতি ১০ মিনিটে আপডেট হয়। বেটিং দায়িত্বের সাথে করুন। ১৮+ শুধুমাত্র।</span>
        </div>
      </div>

      {/* Betslip */}
      <BetSlip items={slip} onRemove={removeFromSlip} onClear={() => setSlip([])} />
    </AppShell>
  );
}
