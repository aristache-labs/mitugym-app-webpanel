"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION, SECONDARY_NAVIGATION } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/(protected)/actions";

export function Sidebar() {
  const pathname = usePathname();
  const signOutItem = SECONDARY_NAVIGATION[0];
  const SignOutIcon = signOutItem.icon;

  return (
    <aside className="flex h-full w-full max-w-[260px] flex-col justify-between border-r border-surface/40 bg-surface/40 px-6 py-8">
      <div className="space-y-8">
        <div>
          <Link href="/dashboard" className="text-2xl font-semibold text-primary">
            MITUGYM
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted">Admin panel</p>
        </div>
        <nav className="space-y-1">
          {NAVIGATION.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-medium transition",
                  active ? "bg-primary/20 text-primary" : "text-muted hover:bg-surface/80 hover:text-text"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="space-y-3">
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" className="w-full justify-start text-sm text-muted hover:text-text">
            <SignOutIcon className="mr-3 h-5 w-5" />
            {signOutItem.label}
          </Button>
        </form>
        <p className="text-xs text-muted/80">
          Signed in as staff. Actions here are recorded in the audit log.
        </p>
      </div>
    </aside>
  );
}
