import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MessageCircle, Phone, HelpCircle, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "সাহায্য ও সহায়তা — বাজি কিং" }] }),
  component: Support,
});

const faqs = [
  { q: "কীভাবে জমা করব?", a: "ওয়ালেট পেজে যান → জমা ট্যাবে পেমেন্ট মেথড বাছাই করুন → পরিমাণ ও ট্রান্সাকশন আইডি দিন। অ্যাডমিন অনুমোদনের পর ব্যালেন্স যোগ হবে।" },
  { q: "উত্তোলনে কতক্ষণ লাগে?", a: "সাধারণত ১–৬ ঘণ্টা। সর্বনিম্ন উত্তোলন ৳৫০০।" },
  { q: "বোনাস কীভাবে পাব?", a: "প্রমোশন পেজে গিয়ে \"দাবি করুন\" বাটনে ক্লিক করুন। শর্তাবলী মেনে চলুন।" },
  { q: "বেট কীভাবে নিষ্পত্তি হয়?", a: "ম্যাচ শেষ হওয়ার পর অ্যাডমিন ফলাফল সেট করলে স্বয়ংক্রিয়ভাবে নিষ্পত্তি হয়।" },
  { q: "অ্যাকাউন্ট নিরাপদ তো?", a: "হ্যাঁ, সব ডেটা এনক্রিপ্টেড। কারো সাথে পাসওয়ার্ড শেয়ার করবেন না।" },
];

const COMPLAINT_CATEGORIES = [
  "জমা সমস্যা",
  "উত্তোলন সমস্যা",
  "বেট বিরোধ",
  "প্রযুক্তিগত সমস্যা",
  "অ্যাকাউন্ট সমস্যা",
  "বোনাস সমস্যা",
  "অন্যান্য",
];

function ComplaintForm() {
  const { user, profile } = useAuth();
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!subject.trim() || !body.trim()) {
      toast.error("বিষয় এবং বিবরণ পূরণ করুন।");
      return;
    }
    if (!user) {
      toast.error("অভিযোগ জমা দিতে লগইন করুন।");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        category,
        subject: subject.trim(),
        body: body.trim(),
        status: "open",
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("আপনার অভিযোগ জমা হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।");
    } catch (err: any) {
      // If table doesn't exist yet, show graceful message
      if (err?.code === "42P01") {
        toast.info("অভিযোগ সিস্টেম শীঘ্রই চালু হবে। এখন WhatsApp-এ যোগাযোগ করুন।");
      } else {
        toast.error("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl bg-green-700/10 border border-green-700/30 p-6 flex flex-col items-center gap-3 text-center">
        <CheckCircle className="w-10 h-10 text-green-400" />
        <div className="font-display text-lg">অভিযোগ জমা হয়েছে</div>
        <p className="text-sm text-muted-foreground">আমরা ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করব।</p>
        <button
          onClick={() => { setSubmitted(false); setSubject(""); setBody(""); }}
          className="mt-2 px-4 py-2 rounded-md bg-card border border-border text-sm"
        >
          নতুন অভিযোগ
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="p-4 border-b border-border/40 font-display flex items-center gap-2">
        <Send className="w-4 h-4 text-gold" />
        অভিযোগ জমা দিন
      </div>
      <div className="p-4 space-y-3">
        {!user && (
          <p className="text-xs text-amber-400 bg-amber-400/10 rounded-lg px-3 py-2">
            অভিযোগ জমা দিতে প্রথমে লগইন করুন।
          </p>
        )}
        <div>
          <label className="text-xs text-muted-foreground block mb-1">বিভাগ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md bg-background border border-border px-3 py-2 text-sm"
          >
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">বিষয়</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="সংক্ষেপে সমস্যাটি লিখুন"
            className="w-full rounded-md bg-background border border-border px-3 py-2 text-sm"
            maxLength={100}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">বিস্তারিত</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="সমস্যাটি বিস্তারিত বর্ণনা করুন..."
            className="w-full rounded-md bg-background border border-border px-3 py-2 text-sm resize-none"
            rows={4}
            maxLength={1000}
          />
          <div className="text-right text-xs text-muted-foreground mt-1">{body.length}/1000</div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || !user}
          className="w-full py-2.5 rounded-md bg-gold-gradient text-gold-foreground text-sm font-bold glow-gold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "জমা হচ্ছে..." : "জমা দিন"}
        </button>
      </div>
    </div>
  );
}

function Support() {
  const [open, setOpen] = useState<number | null>(0);
  const [tab, setTab] = useState<"faq" | "complaint">("faq");

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-gold" />
          <h1 className="text-2xl font-display">সাহায্য কেন্দ্র</h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a href="https://wa.me/8801700000000" target="_blank" rel="noopener" className="rounded-xl bg-green-700/20 border border-green-700/40 p-4 flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-green-400" />
            <div><div className="font-display">WhatsApp</div><div className="text-xs text-muted-foreground">২৪/৭ সাপোর্ট</div></div>
          </a>
          <a href="tel:+8801700000000" className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
            <Phone className="w-6 h-6 text-gold" />
            <div><div className="font-display">ফোন কল</div><div className="text-xs text-muted-foreground">+8801700000000</div></div>
          </a>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("faq")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "faq" ? "bg-gold-gradient text-gold-foreground" : "bg-card border border-border text-muted-foreground"}`}
          >
            প্রায়শই জিজ্ঞাসিত
          </button>
          <button
            onClick={() => setTab("complaint")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "complaint" ? "bg-gold-gradient text-gold-foreground" : "bg-card border border-border text-muted-foreground"}`}
          >
            অভিযোগ জমা
          </button>
        </div>

        {tab === "faq" ? (
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="p-4 border-b border-border/40 font-display">প্রায়শই জিজ্ঞাসিত প্রশ্ন</div>
            {faqs.map((f, i) => (
              <div key={i} className="border-b border-border/30 last:border-0">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left p-4 flex justify-between items-center">
                  <span className="font-semibold">{f.q}</span>
                  <span className="text-gold">{open === i ? "−" : "+"}</span>
                </button>
                {open === i && <p className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</p>}
              </div>
            ))}
          </div>
        ) : (
          <ComplaintForm />
        )}
      </div>
    </AppShell>
  );
}
