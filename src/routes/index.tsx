import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Dice5, Plane, Spade, Ticket, Gift, Sparkles, Megaphone } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BannerSlideshow } from "@/components/BannerSlideshow";
import { supabase } from "@/integrations/supabase/client";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "বাজি কিং — বাংলাদেশের প্রিমিয়াম ক্যাসিনো প্ল্যাটফর্ম" },
      { name: "description", content: "ক্যাসিনো, রুলেট, অ্যাভিয়েটর, স্লট ও লটারি — সব এক জায়গায়।" },
    ],
  }),
  component: Index,
});

const categories = [
  { to: "/casino", label: "লাইভ ক্যাসিনো", desc: "ব্যাকারেট • রুলেট • আন্দার বাহার", Icon: Spade, accent: "from-rose-500/20 to-pink-600/10" },
  { to: "/aviator", label: "অ্যাভিয়েটর", desc: "ক্র্যাশ গেম", Icon: Plane, accent: "from-emerald-500/20 to-teal-600/10" },
  { to: "/slots", label: "স্লট মেশিন", desc: "জ্যাকপট ও মেগাউইন", Icon: Dice5, accent: "from-violet-500/20 to-indigo-600/10" },
  { to: "/lottery", label: "লটারি", desc: "নম্বর গেমস", Icon: Ticket, accent: "from-cyan-500/20 to-sky-600/10" },
  { to: "/promotions", label: "প্রমোশন", desc: "বোনাস ক্লেইম করুন", Icon: Gift, accent: "from-yellow-500/20 to-amber-600/10" },
] as const;

const bnNames = ["রাজু", "করিম", "সাবরিনা", "আনিস", "নাফিস", "তানভীর", "মুস্তাফিজ", "জুবায়ের"];
const winFeed = Array.from({ length: 12 }, (_, i) => ({
  name: bnNames[i % bnNames.length],
  amount: [1250, 5800, 12400, 720, 9300, 3100, 21000, 450][i % 8],
  game: ["অ্যাভিয়েটর", "রুলেট", "স্লট", "ড্রাগন টাইগার", "ব্যাকারেট"][i % 5],
}));

function Index() {
  const { data: updates } = useQuery({
    queryKey: ["home-updates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("feature_updates")
        .select("id,title_bn,body_bn,image_url,created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <AppShell>
      {/* Slideshow */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <BannerSlideshow />
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 gold-border px-3 py-1 text-xs text-gold mb-3">
            <Sparkles className="w-3 h-3" /> নতুন সদস্যদের জন্য ১০০% বোনাস
          </div>
          <h1 className="text-3xl md:text-5xl font-display leading-tight max-w-2xl">
            বাংলাদেশের <span className="gold-text">প্রিমিয়াম</span> ক্যাসিনো অভিজ্ঞতা
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            ক্যাসিনো, অ্যাভিয়েটর, স্লট ও লটারি — সব এক জায়গায়। নিরাপদ, দ্রুত এবং পুরোপুরি বাংলায়।
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
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
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card-gradient p-5 transition hover:gold-border hover:glow-gold"
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

      {/* Feature updates */}
      {(updates?.length ?? 0) > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-display flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-gold" /> সর্বশেষ আপডেট
            </h2>
            <Link to="/updates" className="text-sm text-gold">সব দেখুন →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {updates!.map((u) => (
              <div key={u.id} className="rounded-xl border border-border/60 bg-card-gradient p-4">
                {u.image_url && <img src={u.image_url} alt="" className="w-full h-32 object-cover rounded-md mb-2" />}
                <div className="font-display text-lg gold-text">{u.title_bn}</div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{u.body_bn}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(u.created_at).toLocaleDateString("bn-BD")}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
