import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "ওয়ালেট — বাজি কিং" }] }),
  component: Wallet,
});

const methods = [
  { id: "bkash", label: "bKash", color: "bg-pink-600", account: "017XXXXXXXX" },
  { id: "nagad", label: "Nagad", color: "bg-orange-600", account: "018XXXXXXXX" },
  { id: "rocket", label: "Rocket", color: "bg-purple-700", account: "019XXXXXXXX" },
  { id: "bank", label: "ব্যাংক ট্রান্সফার", color: "bg-blue-700", account: "A/C: 1234-5678-9012" },
] as const;

function Wallet() {
  const { user, profile, refresh } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"deposit" | "withdraw" | "history">("deposit");

  const { data: txns } = useQuery({
    queryKey: ["transactions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (!user) {
    return <AppShell><div className="max-w-md mx-auto p-8 text-center text-muted-foreground">আগে লগইন করুন।</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="rounded-2xl bg-card-gradient gold-border p-6 glow-gold mb-4">
          <div className="text-xs text-muted-foreground">মূল ব্যালেন্স</div>
          <div className="text-4xl font-display gold-text mt-1">{bdt(profile?.balance)}</div>
          <div className="text-xs text-muted-foreground mt-2">বোনাস ব্যালেন্স: <span className="text-success">{bdt(profile?.bonus_balance)}</span></div>
        </div>

        <div className="grid grid-cols-3 mb-4 rounded-md bg-secondary p-1">
          <TabBtn active={tab === "deposit"} onClick={() => setTab("deposit")} icon={<ArrowDownToLine className="w-4 h-4" />}>জমা</TabBtn>
          <TabBtn active={tab === "withdraw"} onClick={() => setTab("withdraw")} icon={<ArrowUpFromLine className="w-4 h-4" />}>উত্তোলন</TabBtn>
          <TabBtn active={tab === "history"} onClick={() => setTab("history")} icon={<History className="w-4 h-4" />}>ইতিহাস</TabBtn>
        </div>

        {tab === "deposit" && <DepositForm onDone={() => { refresh(); qc.invalidateQueries({ queryKey: ["transactions"] }); setTab("history"); }} />}
        {tab === "withdraw" && <WithdrawForm balance={Number(profile?.balance ?? 0)} onDone={() => { qc.invalidateQueries({ queryKey: ["transactions"] }); setTab("history"); }} />}
        {tab === "history" && <HistoryList txns={txns ?? []} />}
      </div>
    </AppShell>
  );
}

function TabBtn({ active, onClick, children, icon }: any) {
  return (
    <button onClick={onClick} className={`py-2 rounded text-sm font-semibold flex items-center justify-center gap-1.5 ${active ? "bg-gold-gradient text-gold-foreground" : "text-muted-foreground"}`}>
      {icon}{children}
    </button>
  );
}

function DepositForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [method, setMethod] = useState<string>("bkash");
  const [amount, setAmount] = useState(500);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const m = methods.find((x) => x.id === method)!;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 100) { toast.error("সর্বনিম্ন জমা ৳১০০"); return; }
    if (!reference.trim()) { toast.error("ট্রান্সাকশন আইডি দিন"); return; }
    setLoading(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user!.id, type: "deposit", amount, method, reference, status: "pending",
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("জমার অনুরোধ গ্রহণ করা হয়েছে। অ্যাডমিন অনুমোদনের জন্য অপেক্ষা করুন।");
    setReference("");
    onDone();
  };

  return (
    <form onSubmit={submit} className="rounded-xl bg-card border border-border p-4 space-y-4">
      <div>
        <div className="text-xs text-muted-foreground mb-2">পেমেন্ট মেথড</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {methods.map((x) => (
            <button type="button" key={x.id} onClick={() => setMethod(x.id)}
              className={`py-3 rounded-md text-sm font-bold text-white ${x.color} ${method === x.id ? "ring-2 ring-gold" : "opacity-70"}`}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md bg-secondary/60 p-3 text-sm">
        <div className="text-muted-foreground text-xs">এই অ্যাকাউন্টে পেমেন্ট পাঠান:</div>
        <div className="font-mono font-bold text-gold mt-1">{m.account}</div>
        <div className="text-xs text-muted-foreground mt-1">পাঠানোর পরে নিচে ট্রান্সাকশন আইডি দিন।</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="text-xs text-muted-foreground">পরিমাণ (৳)</span>
          <input type="number" min={100} value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-full mt-1 rounded-md bg-input border border-border px-3 py-2" />
        </label>
        <label>
          <span className="text-xs text-muted-foreground">ট্রান্সাকশন আইডি</span>
          <input value={reference} onChange={(e) => setReference(e.target.value)} className="w-full mt-1 rounded-md bg-input border border-border px-3 py-2" placeholder="যেমন TX12345" />
        </label>
      </div>
      <div className="flex gap-2 flex-wrap">
        {[500, 1000, 5000, 10000].map((v) => (
          <button type="button" key={v} onClick={() => setAmount(v)} className="rounded bg-secondary px-3 py-1.5 text-xs">৳{v}</button>
        ))}
      </div>
      <button disabled={loading} className="w-full rounded-md bg-gold-gradient py-3 font-bold text-gold-foreground glow-gold disabled:opacity-60">
        {loading ? "জমা হচ্ছে..." : "জমার অনুরোধ পাঠান"}
      </button>
    </form>
  );
}

function WithdrawForm({ balance, onDone }: { balance: number; onDone: () => void }) {
  const { user } = useAuth();
  const [method, setMethod] = useState("bkash");
  const [amount, setAmount] = useState(500);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 500) { toast.error("সর্বনিম্ন উত্তোলন ৳৫০০"); return; }
    if (amount > balance) { toast.error("ব্যালেন্স পর্যাপ্ত নয়"); return; }
    if (!account.trim()) { toast.error("অ্যাকাউন্ট নম্বর দিন"); return; }
    setLoading(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user!.id, type: "withdrawal", amount, method, account_number: account, status: "pending",
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("উত্তোলন অনুরোধ গ্রহণ করা হয়েছে।");
    setAccount("");
    onDone();
  };

  return (
    <form onSubmit={submit} className="rounded-xl bg-card border border-border p-4 space-y-4">
      <div>
        <div className="text-xs text-muted-foreground mb-2">মেথড</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {methods.map((x) => (
            <button type="button" key={x.id} onClick={() => setMethod(x.id)}
              className={`py-3 rounded-md text-sm font-bold text-white ${x.color} ${method === x.id ? "ring-2 ring-gold" : "opacity-70"}`}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="text-xs text-muted-foreground">আপনার অ্যাকাউন্ট নম্বর</span>
        <input value={account} onChange={(e) => setAccount(e.target.value)} className="w-full mt-1 rounded-md bg-input border border-border px-3 py-2" placeholder="01XXXXXXXXX" />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">পরিমাণ (৳) — সর্বনিম্ন ৳৫০০</span>
        <input type="number" min={500} value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-full mt-1 rounded-md bg-input border border-border px-3 py-2" />
      </label>
      <button disabled={loading} className="w-full rounded-md bg-gold-gradient py-3 font-bold text-gold-foreground glow-gold disabled:opacity-60">
        {loading ? "প্রক্রিয়াকরণ..." : "উত্তোলন অনুরোধ"}
      </button>
    </form>
  );
}

function HistoryList({ txns }: { txns: any[] }) {
  const tType: Record<string, string> = { deposit: "জমা", withdrawal: "উত্তোলন", bonus: "বোনাস", adjustment: "সমন্বয়" };
  const tStatus: Record<string, string> = { pending: "অপেক্ষমান", approved: "অনুমোদিত", rejected: "প্রত্যাখ্যাত" };
  const sColor: Record<string, string> = { pending: "text-amber-400", approved: "text-success", rejected: "text-destructive" };

  if (txns.length === 0) {
    return <div className="rounded-xl bg-card border border-border p-8 text-center text-muted-foreground">কোনো লেনদেন নেই।</div>;
  }
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary/60 text-xs text-muted-foreground">
          <tr><th className="p-2.5 text-left">তারিখ</th><th className="p-2.5 text-left">ধরন</th><th className="p-2.5 text-right">পরিমাণ</th><th className="p-2.5 text-right">স্ট্যাটাস</th></tr>
        </thead>
        <tbody>
          {txns.map((t) => (
            <tr key={t.id} className="border-t border-border/40">
              <td className="p-2.5 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("bn-BD")}</td>
              <td className="p-2.5">{tType[t.type] ?? t.type} <span className="text-xs text-muted-foreground">({t.method})</span></td>
              <td className="p-2.5 text-right font-bold">{bdt(t.amount)}</td>
              <td className={`p-2.5 text-right font-semibold ${sColor[t.status]}`}>{tStatus[t.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
