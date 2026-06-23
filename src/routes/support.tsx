import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MessageCircle, Phone, HelpCircle } from "lucide-react";
import { useState } from "react";

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

function Support() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-2"><HelpCircle className="w-5 h-5 text-gold" /><h1 className="text-2xl font-display">সাহায্য কেন্দ্র</h1></div>

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
      </div>
    </AppShell>
  );
}
