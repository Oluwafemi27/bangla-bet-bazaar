import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/lottery")({
  head: () => ({ meta: [{ title: "লটারি — বাজি কিং" }] }),
  component: Lottery,
});

function Lottery() {
  const [picks, setPicks] = useState<number[]>([]);
  const [tickets, setTickets] = useState<{ numbers: number[]; draw: string }[]>([]);
  const drawAt = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const [left, setLeft] = useState("");

  useEffect(() => {
    const t = setInterval(() => {
      const diff = drawAt.getTime() - Date.now();
      if (diff <= 0) return setLeft("ড্র চলছে");
      const h = Math.floor(diff / 3.6e6), m = Math.floor((diff % 3.6e6) / 6e4), s = Math.floor((diff % 6e4) / 1000);
      setLeft(`${h}ঘ ${m}মি ${s}সে`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const togglePick = (n: number) => {
    setPicks((p) => p.includes(n) ? p.filter((x) => x !== n) : p.length >= 6 ? p : [...p, n]);
  };
  const quickPick = () => {
    const set = new Set<number>();
    while (set.size < 6) set.add(1 + Math.floor(Math.random() * 49));
    setPicks([...set].sort((a, b) => a - b));
  };
  const buy = () => {
    if (picks.length !== 6) return toast.error("৬টি সংখ্যা বাছাই করুন");
    setTickets((t) => [...t, { numbers: [...picks].sort((a, b) => a - b), draw: drawAt.toLocaleString("bn-BD") }]);
    setPicks([]);
    toast.success("টিকিট কেনা হয়েছে!");
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-gold" />
          <h1 className="text-2xl font-display">লটারি</h1>
        </div>

        <div className="rounded-2xl bg-card-gradient gold-border p-5 glow-gold text-center">
          <div className="text-xs text-muted-foreground">আজকের জ্যাকপট</div>
          <div className="text-3xl font-display gold-text mt-1">{bdt(150000)}</div>
          <div className="mt-3 text-sm">পরবর্তী ড্র: <span className="font-bold text-gold">{left}</span></div>
          <div className="text-xs text-muted-foreground mt-1">টিকিট মূল্য: ৳৫০</div>
        </div>

        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display">৬টি সংখ্যা বাছাই করুন (১–৪৯)</h3>
            <button onClick={quickPick} className="text-xs rounded bg-secondary px-3 py-1.5">কুইক পিক</button>
          </div>
          <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5">
            {Array.from({ length: 49 }, (_, i) => i + 1).map((n) => {
              const sel = picks.includes(n);
              return (
                <button key={n} onClick={() => togglePick(n)}
                  className={`aspect-square rounded-md text-sm font-bold ${sel ? "bg-gold-gradient text-gold-foreground glow-gold" : "bg-secondary text-muted-foreground"}`}>
                  {n}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">নির্বাচিত: {picks.length}/৬</div>
            <button onClick={buy} className="rounded-md bg-gold-gradient px-5 py-2 font-bold text-gold-foreground">টিকিট কিনুন (৳৫০)</button>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-4">
          <h3 className="font-display mb-3">আমার টিকিট</h3>
          {tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">কোনো টিকিট নেই।</p>
          ) : (
            <ul className="space-y-2">
              {tickets.map((t, i) => (
                <li key={i} className="flex items-center justify-between rounded-md bg-secondary/60 p-2.5">
                  <div className="flex gap-1.5">{t.numbers.map((n) => (
                    <span key={n} className="w-7 h-7 rounded-full bg-gold-gradient text-gold-foreground text-xs font-bold flex items-center justify-center">{n}</span>
                  ))}</div>
                  <span className="text-xs text-muted-foreground">{t.draw}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
