import * as React from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import SupabaseProvider from "@/components/providers/supabase-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <QueryProvider>{children}</QueryProvider>
    </SupabaseProvider>
  );
}
