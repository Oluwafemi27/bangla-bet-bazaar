import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { bdt } from "@/lib/format";
import { User as UserIcon, LogOut, Shield } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "অ্যাকাউন্ট — বাজি কিং" }] }),
  component: Profile,
});

function Profile() {
  const { user, profile, signOut, refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.name ?? "");
  const [mobile, setMobile] = useState(profile?.mobile ?? "");

  if (!user) {
    return <AppShell><div className="max-w-md mx-auto p-8 text-center text-muted-foreground">আগে লগইন করুন।</div></AppShell>;
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").update({ name, mobile }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("প্রোফাইল আপডেট হয়েছে");
    refresh();
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="rounded-2xl bg-card-gradient gold-border p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-2xl font-bold text-gold-foreground">
            {(profile?.name?.[0] ?? "ব")}
          </div>
          <div className="flex-1">
            <div className="font-display text-xl">{profile?.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
            <div className="text-xs text-muted-foreground">যোগদান: {new Date(user.created_at).toLocaleDateString("bn-BD")}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">ব্যালেন্স</div>
            <div className="text-lg font-bold gold-text">{bdt(profile?.balance)}</div>
          </div>
        </div>

        <form onSubmit={save} className="rounded-xl bg-card border border-border p-4 space-y-3">
          <h3 className="font-display flex items-center gap-2"><UserIcon className="w-4 h-4 text-gold" /> প্রোফাইল সম্পাদনা</h3>
          <label className="block"><span className="text-xs text-muted-foreground">নাম</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 rounded-md bg-input border border-border px-3 py-2" /></label>
          <label className="block"><span className="text-xs text-muted-foreground">মোবাইল</span>
            <input value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full mt-1 rounded-md bg-input border border-border px-3 py-2" /></label>
          <button className="rounded-md bg-gold-gradient px-4 py-2 font-bold text-gold-foreground">সংরক্ষণ করুন</button>
        </form>

        <div className="rounded-xl bg-card border border-border p-4">
          <h3 className="font-display flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-gold" /> KYC যাচাইকরণ</h3>
          <p className="text-sm text-muted-foreground mb-3">
            স্ট্যাটাস: <span className={profile?.kyc_status === "verified" ? "text-success" : "text-amber-400"}>
              {profile?.kyc_status === "verified" ? "যাচাইকৃত" : "অযাচাইকৃত"}
            </span>
          </p>
          <button onClick={() => toast.info("KYC আপলোড শীঘ্রই চালু হবে")} className="rounded-md border border-border px-4 py-2 text-sm">
            NID আপলোড করুন
          </button>
        </div>

        <button onClick={async () => { await signOut(); navigate({ to: "/" }); }}
          className="w-full rounded-md border border-destructive/40 text-destructive py-3 font-semibold flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> লগআউট
        </button>
      </div>
    </AppShell>
  );
}
