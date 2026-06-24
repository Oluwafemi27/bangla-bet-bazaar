import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type Profile = {
  id: string;
  name: string;
  mobile: string | null;
  balance: number;
  bonus_balance: number;
  referral_code: string;
  kyc_status: string;
  status: string;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const init = async () => {
      try {
        const { supabase: sb } = await import("@/integrations/supabase/client");
        setSupabase(sb);

        const loadProfileLocal = async (uid: string) => {
          try {
            const { data } = await sb
              .from("profiles")
              .select("id,name,mobile,balance,bonus_balance,referral_code,kyc_status,status")
              .eq("id", uid)
              .maybeSingle();
            if (data?.status === "banned") {
              toast.error("আপনার অ্যাকাউন্ট ব্যান করা হয়েছে। সাহায্যের জন্য সাপোর্টে যোগাযোগ করুন।");
              await sb.auth.signOut();
              setProfile(null);
              setIsAdmin(false);
              return;
            }
            setProfile(data as Profile | null);
            const { data: roles } = await sb
              .from("user_roles")
              .select("role")
              .eq("user_id", uid);
            setIsAdmin(!!roles?.some((r) => r.role === "admin"));
          } catch (err) {
            console.error("Failed to load profile:", err);
            setProfile(null);
            setIsAdmin(false);
          }
        };

        const { data: sub } = sb.auth.onAuthStateChange((_event: any, s: any) => {
          setSession(s);
          if (s?.user) {
            setTimeout(() => loadProfileLocal(s.user.id), 0);
          } else {
            setProfile(null);
            setIsAdmin(false);
          }
        });
        unsub = () => sub.subscription.unsubscribe();
        const { data } = await sb.auth.getSession();
        setSession(data.session);
        if (data.session?.user) await loadProfileLocal(data.session.user.id);
      } catch (err) {
        console.warn("Supabase initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => unsub?.();
  }, []);

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        profile,
        isAdmin,
        loading,
        refresh: async () => {
          if (!supabase || !session?.user) return;
          try {
            const { data } = await supabase
              .from("profiles")
              .select("id,name,mobile,balance,bonus_balance,referral_code,kyc_status,status")
              .eq("id", session.user.id)
              .maybeSingle();
            setProfile(data as Profile | null);
          } catch (err) {
            console.error("Failed to refresh profile:", err);
          }
        },
        signOut: async () => {
          if (supabase) await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
