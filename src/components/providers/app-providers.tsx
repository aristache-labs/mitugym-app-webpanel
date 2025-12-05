import * as React from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import SupabaseProvider from "@/components/providers/supabase-provider";
import { SessionMonitor } from "@/components/providers/session-monitor";
import { ToastProvider } from "@/components/ui/toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <SessionMonitor />
      <QueryProvider>
        <ToastProvider>{children}</ToastProvider>
      </QueryProvider>
    </SupabaseProvider>
  );
}
