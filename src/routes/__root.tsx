import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportError } from "../lib/error-reporting";
import { installDomCrashGuard } from "../lib/dom-crash-guard";
import { AuthProvider } from "@/lib/auth";

installDomCrashGuard();

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold gold-text">৪০৪</h1>
        <h2 className="mt-4 text-xl font-semibold">পৃষ্ঠা পাওয়া যায়নি</h2>
        <p className="mt-2 text-sm text-muted-foreground">আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি বিদ্যমান নেই।</p>
        <a href="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-gold-gradient px-4 py-2 text-sm font-bold text-gold-foreground glow-gold">
          হোমে ফিরে যান
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">কিছু সমস্যা হয়েছে</h1>
        <p className="mt-2 text-sm text-muted-foreground">আবার চেষ্টা করুন বা হোমে ফিরে যান।</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-gold-gradient text-gold-foreground px-4 py-2 text-sm font-bold">
            আবার চেষ্টা করুন
          </button>
          <a href="/" className="rounded-md border border-border px-4 py-2 text-sm">হোম</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0a0e1a" },
      { title: "বাজি কিং — বাংলাদেশের প্রিমিয়াম বেটিং প্ল্যাটফর্ম" },
      { name: "description", content: "ক্রিকেট, ক্যাসিনো, অ্যাভিয়েটর, স্লট ও লটারি — সব কিছু একসাথে।" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster theme="dark" position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
