import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plane } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/aviator")({
  head: () => ({ meta: [{ title: "অ্যাভিয়েটর — বাজি কিং" }] }),
  component: Aviator,
});

// provably-fair-ish client sim (Phase 1; in prod move to server fn)
function nextCrash(): number {
  const r = Math.random();
  if (r < 0.03) return 1.0; // instant crash 3%
  // distribution skewed toward low multipliers
  const m = 1 + Math.pow(Math.random(), 2.2) * 24;
  return +Math.max(1.0, m).toFixed(2);
}

function Aviator() {
  const { user, profile, refresh } = useAuth();
  const [phase, setPhase] = useState<"betting" | "flying" | "crashed">("betting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashAt, setCrashAt] = useState(0);
  const [history, setHistory] = useState<number[]>([2.31, 1.05, 5.42, 1.78, 1.21, 3.04, 8.91, 1.43, 2.10, 1.66]);
  const [betAmount, setBetAmount] = useState(100);
  const [autoCashout, setAutoCashout] = useState<number | "">("");
  const [activeBet, setActiveBet] = useState<{ amount: number } | null>(null);
  const [cashedAt, setCashedAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(6);
  const rafRef = useRef<number | undefined>(undefined);
  const startTime = useRef(0);

  // betting phase countdown
  useEffect(() => {
    if (phase !== "betting") return;
    setCountdown(6);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          const cr = nextCrash();
          setCrashAt(cr);
          setMultiplier(1.0);
          setCashedAt(null);
          startTime.current = performance.now();
          setPhase("flying");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // flying animation
  useEffect(() => {
    if (phase !== "flying") return;
    const tick = () => {
      const t = (performance.now() - startTime.current) / 1000;
      // exponential growth: 1.06^t-ish
      const m = +Math.pow(1.06, t * 6).toFixed(2);
      setMultiplier(m);
      if (activeBet && autoCashout && typeof autoCashout === "number" && m >= autoCashout && cashedAt === null) {
        doCashout(m);
      }
      if (m >= crashAt) {
        setPhase("crashed");
        setHistory((h) => [crashAt, ...h].slice(0, 10));
        if (activeBet && cashedAt === null) {
          toast.error(`ক্র্যাশ ${crashAt}x — হেরেছেন`);
        }
        setActiveBet(null);
        setTimeout(() => setPhase("betting"), 2500);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, crashAt]);

  const placeBet = async () => {
    if (!user) { toast.error("আগে লগইন করুন"); return; }
    if (phase !== "betting") { toast.error("পরবর্তী রাউন্ডের জন্য অপেক্ষা করুন"); return; }
    const bal = Number(profile?.balance ?? 0);
    if (betAmount < 10 || betAmount > bal) { toast.error("ব্যালেন্স অপর্যাপ্ত"); return; }
    setActiveBet({ amount: betAmount });
    await supabase.from("profiles").update({ balance: bal - betAmount }).eq("id", user.id);
    await supabase.from("bets").insert({
      user_id: user.id, game_type: "aviator", odds: 1, amount: betAmount,
      potential_payout: betAmount, status: "pending",
    });
    refresh();
    toast.success("বাজি গ্রহণ করা হয়েছে");
  };

  const doCashout = async (m: number) => {
    if (!activeBet || !user) return;
    setCashedAt(m);
    const payout = +(activeBet.amount * m).toFixed(2);
    const bal = Number(profile?.balance ?? 0);
    await supabase.from("profiles").update({ balance: bal + payout }).eq("id", user.id);
    refresh();
    toast.success(`ক্যাশআউট ${m}x — জিতেছেন ${bdt(payout)}`);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-5 h-5 text-gold" />
          <h1 className="text-2xl font-display">অ্যাভিয়েটর</h1>
        </div>

        {/* recent results */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2 mb-3">
          {history.map((h, i) => (
            <span key={i} className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${h >= 2 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
              {h}x
            </span>
          ))}
        </div>

        {/* Game area */}
        <div className="relative aspect-[16/10] md:aspect-[16/7] rounded-2xl overflow-hidden gold-border bg-hero-gradient">
          <div className="absolute inset-0 [background:radial-gradient(circle_at_30%_70%,oklch(0.30_0.10_270/0.6),transparent_60%)]" />
          {/* Plane */}
          <div
            className="absolute text-6xl transition-none"
            style={{
              left: phase === "flying" ? `${Math.min(70, (multiplier - 1) * 8)}%` : "10%",
              bottom: phase === "flying" ? `${Math.min(70, (multiplier - 1) * 10)}%` : "10%",
              transform: phase === "crashed" ? "rotate(90deg)" : `rotate(-${Math.min(40, (multiplier - 1) * 5)}deg)`,
              transition: "left .1s linear, bottom .1s linear",
              filter: phase === "crashed" ? "grayscale(1)" : "drop-shadow(0 0 20px oklch(0.78 0.16 85 / 0.6))",
            }}
          >✈️</div>

          {/* Multiplier */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {phase === "betting" && (
              <>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">পরবর্তী রাউন্ড</div>
                <div className="text-6xl md:text-7xl font-display gold-text">{countdown}</div>
              </>
            )}
            {phase === "flying" && (
              <div className={`text-6xl md:text-8xl font-display ${cashedAt ? "text-success" : "gold-text"}`}>
                {multiplier.toFixed(2)}x
              </div>
            )}
            {phase === "crashed" && (
              <>
                <div className="text-sm text-destructive uppercase tracking-widest">ক্র্যাশ!</div>
                <div className="text-6xl md:text-7xl font-display text-destructive">{crashAt}x</div>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl bg-card-gradient border border-border/60 p-4">
            <label className="block text-xs text-muted-foreground mb-1">বাজির পরিমাণ (৳)</label>
            <input
              type="number" min={10} value={betAmount} onChange={(e) => setBetAmount(+e.target.value)}
              disabled={!!activeBet}
              className="w-full rounded-md bg-input border border-border px-3 py-2"
            />
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[100, 500, 1000, 5000].map((v) => (
                <button key={v} onClick={() => setBetAmount(v)} className="rounded bg-secondary py-1.5 text-xs">৳{v}</button>
              ))}
            </div>
            <label className="block text-xs text-muted-foreground mt-3 mb-1">অটো ক্যাশআউট (x) — ঐচ্ছিক</label>
            <input
              type="number" step="0.1" min={1.1} value={autoCashout}
              onChange={(e) => setAutoCashout(e.target.value ? +e.target.value : "")}
              placeholder="যেমন 2.0"
              className="w-full rounded-md bg-input border border-border px-3 py-2"
            />
          </div>

          <div className="rounded-xl bg-card-gradient border border-border/60 p-4 flex flex-col justify-center">
            {!activeBet ? (
              <button onClick={placeBet} disabled={phase !== "betting"} className="w-full rounded-md bg-gold-gradient py-4 font-bold text-gold-foreground glow-gold disabled:opacity-50">
                {phase === "betting" ? `বাজি ধরুন (${countdown}s)` : "অপেক্ষা করুন..."}
              </button>
            ) : (
              <button
                onClick={() => phase === "flying" && doCashout(multiplier)}
                disabled={phase !== "flying" || cashedAt !== null}
                className="w-full rounded-md bg-success py-4 font-bold text-success-foreground glow-neon disabled:opacity-50"
              >
                {cashedAt ? `ক্যাশআউট হয়েছে ${cashedAt}x` : `ক্যাশআউট ${bdt(+(activeBet.amount * multiplier).toFixed(2))}`}
              </button>
            )}
            <p className="text-xs text-muted-foreground mt-3 text-center">
              ১৮+ ব্যবহারকারীদের জন্য। দায়িত্বশীলভাবে খেলুন।
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
