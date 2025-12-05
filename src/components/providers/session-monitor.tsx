"use client";

import { useEffect } from "react";
import { useSupabase } from "./supabase-provider";

/**
 * SessionMonitor handles "Remember me" functionality
 * If user unchecks "Remember me", session is cleared on browser close
 */
export function SessionMonitor() {
  const { supabase } = useSupabase();

  useEffect(() => {
    if (!supabase) return;

    // Check if this is a temporary session (Remember me was unchecked)
    const isTempSession = sessionStorage.getItem('tempSession') === 'true';

    // If it's a temp session and we're in a new browser session
    // (sessionStorage is cleared on browser close), sign out
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if session is still valid
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session && isTempSession) {
            // Session exists but should have been cleared
            // This means browser was closed and reopened
            // Session should be cleared
          }
        });
      }
    };

    // Monitor for browser close
    const handleBeforeUnload = () => {
      const isTempSession = sessionStorage.getItem('tempSession') === 'true';
      if (isTempSession) {
        // Sign out when browser is closing for temp sessions
        supabase.auth.signOut();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [supabase]);

  return null;
}

