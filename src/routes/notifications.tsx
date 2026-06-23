import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "বিজ্ঞপ্তি — বাজি কিং" }] }),
  component: Notifications,
});

function Notifications() {
  const { user } = useAuth();
  const { data: items } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").or(`user_id.eq.${user!.id},user_id.is.null`).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4"><Bell className="w-5 h-5 text-gold" /><h1 className="text-2xl font-display">বিজ্ঞপ্তি</h1></div>
        {(items?.length ?? 0) === 0 ? (
          <div className="rounded-xl bg-card border border-border p-8 text-center text-muted-foreground">কোনো নতুন বিজ্ঞপ্তি নেই।</div>
        ) : (
          <ul className="space-y-2">
            {items!.map((n: any) => (
              <li key={n.id} className="rounded-xl bg-card border border-border p-4">
                <p className="text-sm">{n.message_bn}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("bn-BD")}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
