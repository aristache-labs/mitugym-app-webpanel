"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAVIGATION, SECONDARY_NAVIGATION } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/(protected)/actions";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const signOutItem = SECONDARY_NAVIGATION[0];
  const SignOutIcon = signOutItem.icon;

  const handleLinkClick = () => {
    // Close mobile menu when navigating
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-[280px] flex-col justify-between border-r border-surface/40 bg-surface/95 backdrop-blur-xl px-6 py-8 shadow-2xl transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:w-full lg:max-w-[260px] lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Close Button */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">MITUGYM</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted/70">Menu</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted transition-colors hover:bg-surface/80 hover:text-text"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8">
          <nav className="space-y-2">
            {NAVIGATION.map((item) => {
              const active = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/20 text-primary shadow-lg shadow-primary/10"
                      : "text-muted hover:bg-surface/80 hover:text-text hover:shadow-md"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="space-y-3">
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-sm text-muted hover:text-text"
            >
              <SignOutIcon className="mr-3 h-5 w-5" />
              {signOutItem.label}
            </Button>
          </form>
          <p className="text-xs text-muted/80">
            Signed in as staff. Actions here are recorded in the audit log.
          </p>
        </div>
      </aside>
    </>
  );
}
