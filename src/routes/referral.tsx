import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Share2, Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/referral")({
  head: () => ({ meta: [{ title: "রেফারেল — বাজি কিং" }] }),
  component: Referral,
});

function Referral() {
  const { profile } = useAuth();
  const code = profile?.referral_code ?? "————";
  const link = typeof window !== "undefined" ? `${window.location.origin}/auth?ref=${code}` : "";

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-gold" />
          <h1 className="text-2xl font-display">রেফারেল প্রোগ্রাম</h1>
        </div>

        <div className="rounded-2xl bg-card-gradient gold-border p-6 glow-gold text-center">
          <div className="text-xs text-muted-foreground">আপনার রেফারেল কোড</div>
          <div className="text-4xl font-display gold-text mt-2 tracking-widest">{code}</div>
          <div className="mt-4 flex gap-2 justify-center">
            <button onClick={() => { navigator.clipboard.writeText(code); toast.success("কপি হয়েছে"); }}
              className="rounded-md bg-secondary px-4 py-2 text-sm flex items-center gap-1.5"><Copy className="w-4 h-4" /> কোড</button>
            <button onClick={() => { navigator.clipboard.writeText(link); toast.success("লিংক কপি হয়েছে"); }}
              className="rounded-md bg-gold-gradient px-4 py-2 text-sm font-bold text-gold-foreground flex items-center gap-1.5">
              <Share2 className="w-4 h-4" /> লিংক শেয়ার
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="মোট রেফার" value="০ জন" />
          <Stat label="মোট আয়" value="৳০" />
        </div>

        <div className="rounded-xl bg-card border border-border p-4">
          <h3 className="font-display mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-gold" /> কমিশন কাঠামো</h3>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground"><tr><th className="text-left p-2">স্তর</th><th className="text-right p-2">কমিশন</th></tr></thead>
            <tbody>
              {[
                { l: "১ম স্তর (সরাসরি)", c: "৩০% NGR" },
                { l: "২য় স্তর", c: "১০% NGR" },
                { l: "৩য় স্তর", c: "৫% NGR" },
                { l: "নতুন সাইনআপ বোনাস", c: "৳২০০ / বন্ধু" },
              ].map((r) => (
                <tr key={r.l} className="border-t border-border/40"><td className="p-2">{r.l}</td><td className="p-2 text-right text-gold font-semibold">{r.c}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-display gold-text mt-1">{value}</div>
    </div>
  );
}
