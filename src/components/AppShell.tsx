import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Gamepad2, Wallet, User, LogIn, Bell, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { bdt } from "@/lib/format";

const navItems = [
  { to: "/", label: "হোম", icon: Home },
  { to: "/casino", label: "গেমস", icon: Gamepad2 },
  { to: "/wallet", label: "ওয়ালেট", icon: Wallet },
  { to: "/profile", label: "অ্যাকাউন্ট", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, user, isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gold-gradient flex items-center justify-center font-bold text-gold-foreground">বি</div>
            <span className="font-display text-lg gold-text hidden sm:inline">বাজি কিং</span>
          </Link>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className="h-9 px-3 rounded-md bg-card gold-border text-sm font-semibold text-gold inline-flex items-center gap-1">
                <Shield className="w-4 h-4" /> অ্যাডমিন
              </Link>
            )}
            {user ? (
              <>
                <Link to="/wallet" className="flex items-center gap-2 px-3 h-9 rounded-md bg-card gold-border text-sm font-semibold">
                  <span className="text-gold">{bdt(profile?.balance)}</span>
                </Link>
                <Link to="/notifications" className="h-9 w-9 rounded-md bg-card border border-border flex items-center justify-center" aria-label="বিজ্ঞপ্তি">
                  <Bell className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <Link to="/auth" className="flex items-center gap-1.5 px-4 h-9 rounded-md bg-gold-gradient text-gold-foreground text-sm font-bold glow-gold">
                <LogIn className="w-4 h-4" /> লগইন
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav className="hidden md:block border-b border-border/40 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {[
            { to: "/casino", label: "ক্যাসিনো" },
            { to: "/cricket", label: "ক্রিকেট" },
            { to: "/aviator", label: "অ্যাভিয়েটর" },
            { to: "/slots", label: "স্লট" },
            { to: "/lottery", label: "লটারি" },
            { to: "/promotions", label: "প্রমোশন" },
            { to: "/referral", label: "রেফারেল" },
            { to: "/updates", label: "আপডেট" },
            { to: "/bet-history", label: "বেট ইতিহাস" },
            { to: "/support", label: "সাহায্য" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-2.5 text-sm whitespace-nowrap text-muted-foreground hover:text-gold data-[status=active]:text-gold data-[status=active]:border-b-2 data-[status=active]:border-gold"
              activeOptions={{ exact: false }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-1 pb-20 md:pb-8">{children}</main>

      <nav className="fixed md:hidden bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-background/90 border-t border-border/60">
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={"flex flex-col items-center gap-1 py-2.5 text-xs " + (active ? "text-gold" : "text-muted-foreground")}>
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
