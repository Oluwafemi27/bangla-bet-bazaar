import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "লগইন / রেজিস্টার — বাজি কিং" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        if (password.length < 6) throw new Error("পাসওয়ার্ড অন্তত ৬ অক্ষর হতে হবে");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name, mobile, referral_code: referral || null },
          },
        });
        if (error) throw error;
        toast.success("অ্যাকাউন্ট তৈরি হয়েছে! এখন লগইন করুন।");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("সফলভাবে লগইন হয়েছে!");
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "কিছু সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-hero-gradient">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-md bg-gold-gradient flex items-center justify-center font-bold text-gold-foreground">বি</div>
          <span className="font-display text-2xl gold-text">বাজি কিং</span>
        </Link>

        <div className="rounded-2xl bg-card-gradient gold-border p-6 glow-gold">
          <div className="grid grid-cols-2 mb-6 rounded-md bg-secondary p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`py-2 rounded text-sm font-semibold ${mode === "login" ? "bg-gold-gradient text-gold-foreground" : "text-muted-foreground"}`}
            >লগইন</button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`py-2 rounded text-sm font-semibold ${mode === "register" ? "bg-gold-gradient text-gold-foreground" : "text-muted-foreground"}`}
            >রেজিস্টার</button>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "register" && (
              <>
                <Field label="নাম">
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="পুরো নাম" />
                </Field>
                <Field label="মোবাইল নম্বর">
                  <input required value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="tel" className="input" placeholder="01XXXXXXXXX" />
                </Field>
              </>
            )}
            <Field label="ইমেইল">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
            </Field>
            <Field label="পাসওয়ার্ড">
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
            </Field>
            {mode === "register" && (
              <Field label="রেফারেল কোড (ঐচ্ছিক)">
                <input value={referral} onChange={(e) => setReferral(e.target.value)} className="input" placeholder="ABC12345" />
              </Field>
            )}

            <button
              disabled={loading}
              className="w-full mt-2 rounded-md bg-gold-gradient py-3 font-bold text-gold-foreground glow-gold disabled:opacity-60"
            >
              {loading ? "অপেক্ষা করুন..." : mode === "login" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
            </button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              চালিয়ে যাওয়ার মাধ্যমে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন। শুধুমাত্র ১৮+ ব্যবহারকারীদের জন্য।
            </p>
          </form>
        </div>

        <Link to="/" className="block text-center mt-4 text-sm text-muted-foreground">← হোমে ফিরে যান</Link>
      </div>

      <style>{`.input{width:100%;border-radius:.5rem;background:var(--color-input);border:1px solid var(--color-border);padding:.6rem .75rem;font-size:.875rem;color:var(--color-foreground)} .input::placeholder{color:var(--color-muted-foreground)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1 text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
