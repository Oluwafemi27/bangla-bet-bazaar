import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Dice5, Plane, Spade, Ticket, Gift, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "বাজি কিং — বাংলাদেশের প্রিমিয়াম বেটিং প্ল্যাটফর্ম" },
      { name: "description", content: "ক্রিকেট, ক্যাসিনো, অ্যাভিয়েটর, স্লট ও লটারি — সব এক জায়গায়।" },
    ],
  }),
  component: Index,
});

const categories = [
  { to: "/cricket", label: "ক্রিকেট", desc: "লাইভ ম্যাচ ও অডস", Icon: Trophy, accent: "from-amber-500/20 to-orange-600/10" },
  { to: "/casino", label: "ক্যাসিনো", desc: "ব্যাকারেট • রুলেট • আন্দার বাহার", Icon: Spade, accent: "from-rose-500/20 to-pink-600/10" },
  { to: "/aviator", label: "অ্যাভিয়েটর", desc: "ক্র্যাশ গেম", Icon: Plane, accent: "from-emerald-500/20 to-teal-600/10" },
  { to: "/slots", label: "স্লট মেশিন", desc: "জ্যাকপট ও মেগাউইন", Icon: Dice5, accent: "from-violet-500/20 to-indigo-600/10" },
  { to: "/lottery", label: "লটারি", desc: "নম্বর গেমস", Icon: Ticket, accent: "from-cyan-500/20 to-sky-600/10" },
  { to: "/promotions", label: "প্রমোশন", desc: "বোনাস ক্লেইম করুন", Icon: Gift, accent: "from-yellow-500/20 to-amber-600/10" },
] as const;

const bnNames = ["রাজু", "করিম", "সাবরিনা", "আনিস", "নাফিস", "তানভীর", "মুস্তাফিজ", "জুবায়ের"];
const winFeed = Array.from({ length: 12 }, (_, i) => ({
  name: bnNames[i % bnNames.length],
  amount: [1250, 5800, 12400, 720, 9300, 3100, 21000, 450][i % 8],
  game: ["অ্যাভিয়েটর", "ক্রিকেট", "রুলেট", "স্লট", "ড্রাগন টাইগার"][i % 5],
}));

function Index() {
  const { data: matches } = useQuery({
    queryKey: ["home-matches"],
    queryFn: async () => {
      const { data } = await supabase
        .from("matches")
        .select("id,team_home,team_away,tournament,start_time,status,odds_markets(market_name,selections)")
        .order("start_time", { ascending: true })
        .limit(4);
      return data ?? [];
    },
  });

  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(oklch(0.78_0.16_85/0.4)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 gold-border px-3 py-1 text-xs text-gold mb-4">
            <Sparkles className="w-3 h-3" /> নতুন সদস্যদের জন্য ১০০% বোনাস
          </div>
          <h1 className="text-4xl md:text-6xl font-display leading-tight max-w-2xl">
            বাংলাদেশের <span className="gold-text">প্রিমিয়াম</span> বেটিং অভিজ্ঞতা
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl">
            ক্রিকেট, ক্যাসিনো, অ্যাভিয়েটর — সব কিছু এক জায়গায়। নিরাপদ, দ্রুত এবং পুরোপুরি বাংলায়।
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-md bg-gold-gradient px-6 py-3 font-bold text-gold-foreground glow-gold">
              এখনই শুরু করুন
            </Link>
            <Link to="/promotions" className="inline-flex items-center gap-2 rounded-md gold-border bg-card/50 px-6 py-3 font-semibold text-gold">
              অফার দেখুন
            </Link>
          </div>
        </div>
      </section>

      {/* Big wins marquee */}
      <div className="border-y border-border/40 bg-card/30 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-2.5 gap-8 text-sm">
          {[...winFeed, ...winFeed].map((w, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-3 h-3 text-gold" />
              <span className="text-foreground">{w.name}</span> জিতেছেন
              <span className="text-success font-bold">{bdt(w.amount)}</span>
              <span className="text-muted-foreground">— {w.game}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Categories grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-display mb-4">গেম ক্যাটাগরি</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className={`group relative overflow-hidden rounded-xl border border-border/60 bg-card-gradient p-5 transition hover:gold-border hover:glow-gold`}
            >
              <div className={`absolute inset-0 opacity-50 bg-gradient-to-br ${c.accent}`} />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-gold/10 gold-border flex items-center justify-center mb-3">
                  <c.Icon className="w-6 h-6 text-gold" />
                </div>
                <div className="font-display text-lg">{c.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured cricket matches */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-display">ফিচার্ড ক্রিকেট ম্যাচ</h2>
          <Link to="/cricket" className="text-sm text-gold">সব দেখুন →</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {(matches ?? []).map((m: any) => {
            const sels = m.odds_markets?.[0]?.selections ?? [];
            return (
              <Link
                key={m.id}
                to="/cricket"
                className="rounded-xl border border-border/60 bg-card-gradient p-4 hover:gold-border transition"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{m.tournament}</span>
                  <span className={m.status === "live" ? "text-success font-bold" : ""}>
                    {m.status === "live" ? "● লাইভ" : new Date(m.start_time).toLocaleString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="mt-2 font-display text-lg">
                  {m.team_home} <span className="text-muted-foreground text-sm">বনাম</span> {m.team_away}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {sels.slice(0, 3).map((s: any, i: number) => (
                    <div key={i} className="rounded-md bg-secondary/60 border border-border/50 px-3 py-2 text-center">
                      <div className="text-[10px] text-muted-foreground truncate">{s.label}</div>
                      <div className="text-gold font-bold">{s.odds}</div>
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
