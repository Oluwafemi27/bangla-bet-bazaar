import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Shield, LayoutDashboard, Users, ArrowDownUp, Megaphone, Image, Sparkles, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";

const adminNav = [
  { to: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { to: "/admin/users", label: "ব্যবহারকারী", icon: Users },
  { to: "/admin/transactions", label: "লেনদেন", icon: ArrowDownUp },
  { to: "/admin/broadcast", label: "ব্রডকাস্ট", icon: Megaphone },
  { to: "/admin/messages", label: "ডাইরেক্ট মেসেজ", icon: MessageSquare },
  { to: "/admin/banners", label: "ব্যানার", icon: Image },
  { to: "/admin/updates", label: "ফিচার আপডেট", icon: Sparkles },
];

export function AdminGate({ children }: { children: ReactNode }) {
  const { isAdmin, loading, user } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">লোড হচ্ছে...</div>;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gold mx-auto mb-3" />
          <h1 className="font-display text-xl">অ্যাডমিন লগইন প্রয়োজন</h1>
          <Link to="/auth" className="mt-4 inline-block rounded-md bg-gold-gradient px-4 py-2 font-bold text-gold-foreground">লগইন</Link>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <Shield className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h1 className="font-display text-xl">অ্যাক্সেস নিষেধ</h1>
          <p className="text-sm text-muted-foreground mt-1">এই পৃষ্ঠাটি শুধুমাত্র অ্যাডমিনদের জন্য।</p>
          <Link to="/" className="mt-4 inline-block rounded-md gold-border px-4 py-2">হোম</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="md:w-64 md:min-h-screen border-r border-border bg-card/40">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Shield className="w-5 h-5 text-gold" />
          <span className="font-display gold-text">অ্যাডমিন প্যানেল</span>
        </div>
        <nav className="p-2 flex md:flex-col gap-1 overflow-x-auto">
          {adminNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-gold hover:bg-gold/5 data-[status=active]:text-gold data-[status=active]:bg-gold/10 whitespace-nowrap"
              activeOptions={{ exact: item.to === "/admin" }}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
            ← সাইটে ফিরুন
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-auto">{children}</main>
    </div>
  );
}
