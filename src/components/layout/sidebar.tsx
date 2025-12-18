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
      {/* Global Styles for Animated Buttons */}
      <style jsx global>{`
        .nav-button-animated {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 10px 16px;
          transition: 0.5s;
          position: relative;
          font-size: 11.5px;
          background: transparent;
          border: 1px solid rgba(77, 212, 212, 0.2);
          color: rgb(255, 255, 255);
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          border-radius: 0;
          width: 100%;
          cursor: pointer;
          margin-bottom: 12px;
          white-space: nowrap;
        }

        .nav-button-animated:hover {
          letter-spacing: 0.18em;
          background: rgba(77, 212, 212, 0.08);
          border-color: rgba(77, 212, 212, 0.5);
          color: rgb(77, 212, 212);
          box-shadow: 0 0 20px rgba(77, 212, 212, 0.2), inset 0 0 20px rgba(77, 212, 212, 0.05);
        }

        .nav-button-animated::before {
          content: '';
          position: absolute;
          inset: 2px;
          background: rgba(13, 17, 23, 0.4);
          backdrop-filter: blur(10px);
        }

        .nav-button-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          overflow: hidden;
        }

        .nav-button-content span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nav-button-border {
          position: absolute;
          inset: 0;
          display: block;
          pointer-events: none;
        }

        .nav-button-border::before {
          content: '';
          position: absolute;
          border: 2px solid rgba(77, 212, 212, 0.6);
          width: 7px;
          height: 4px;
          top: -2px;
          left: 80%;
          background: rgba(13, 17, 23, 0.8);
          transform: translateX(-50%);
          transition: 0.5s;
        }

        .nav-button-animated:hover .nav-button-border::before {
          width: 20px;
          left: 20%;
          border-color: rgb(77, 212, 212);
          box-shadow: 0 0 8px rgba(77, 212, 212, 0.6);
        }

        .nav-button-border::after {
          content: '';
          position: absolute;
          border: 2px solid rgba(77, 212, 212, 0.6);
          width: 7px;
          height: 4px;
          bottom: -2px;
          left: 20%;
          background: rgba(13, 17, 23, 0.8);
          transform: translateX(-50%);
          transition: 0.5s;
        }

        .nav-button-animated:hover .nav-button-border::after {
          width: 20px;
          left: 80%;
          border-color: rgb(77, 212, 212);
          box-shadow: 0 0 8px rgba(77, 212, 212, 0.6);
        }

        /* Active state */
        .nav-button-animated.active {
          background: rgba(77, 212, 212, 0.12);
          border-color: rgba(77, 212, 212, 0.6);
          color: rgb(77, 212, 212);
          box-shadow: 0 0 15px rgba(77, 212, 212, 0.25), inset 0 0 15px rgba(77, 212, 212, 0.08);
        }

        .nav-button-animated.active .nav-button-border::before,
        .nav-button-animated.active .nav-button-border::after {
          border-color: rgb(77, 212, 212);
          box-shadow: 0 0 10px rgba(77, 212, 212, 0.5);
          width: 15px;
        }

        .nav-button-animated.active .nav-button-border::before {
          left: 20%;
        }

        .nav-button-animated.active .nav-button-border::after {
          left: 80%;
        }

        /* Sign Out button - Red variant */
        .nav-button-signout {
          border-color: rgba(239, 68, 68, 0.2);
        }

        .nav-button-signout:hover {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.5);
          color: rgb(239, 68, 68);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.2), inset 0 0 20px rgba(239, 68, 68, 0.05);
        }

        .nav-button-signout .nav-button-border::before,
        .nav-button-signout .nav-button-border::after {
          border-color: rgba(239, 68, 68, 0.6);
        }

        .nav-button-signout:hover .nav-button-border::before {
          border-color: rgb(239, 68, 68);
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
        }

        .nav-button-signout:hover .nav-button-border::after {
          border-color: rgb(239, 68, 68);
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
        }

        /* Mobile responsive styles */
        @media (max-width: 1024px) {
          .nav-button-animated {
            padding: 8px 12px;
            font-size: 10.5px;
            gap: 8px;
            margin-bottom: 8px;
            letter-spacing: 0.06em;
          }

          .nav-button-animated:hover {
            letter-spacing: 0.14em;
          }

          .nav-button-content {
            gap: 8px;
          }

          .nav-button-content svg {
            width: 16px;
            height: 16px;
          }

          .nav-button-border::before,
          .nav-button-border::after {
            width: 5px;
            height: 3px;
          }

          .nav-button-animated:hover .nav-button-border::before,
          .nav-button-animated:hover .nav-button-border::after {
            width: 15px;
          }

          .nav-button-animated.active .nav-button-border::before,
          .nav-button-animated.active .nav-button-border::after {
            width: 12px;
          }
        }
      `}</style>

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
          "fixed inset-y-0 left-0 z-50 flex h-full w-[280px] flex-col border-r border-surface/40 bg-surface/95 backdrop-blur-xl px-6 pt-4 pb-4 lg:py-8 shadow-2xl transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:w-full lg:max-w-[260px] lg:translate-x-0 lg:shadow-none lg:justify-between lg:bg-transparent lg:backdrop-blur-none lg:border-r-0",
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

        <div className="space-y-4 lg:space-y-8 flex-1 overflow-y-auto">
          <nav className="space-y-0">
            {NAVIGATION.map((item) => {
              const active = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn("nav-button-animated", active && "active")}
                >
                  <span className="nav-button-content">
                    <Icon className="h-5 w-5 lg:h-5 lg:w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  <i className="nav-button-border"></i>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="space-y-3 mt-auto pt-6">
          <form action={signOutAction}>
            <button
              type="submit"
              className="nav-button-animated nav-button-signout"
            >
              <span className="nav-button-content">
                <SignOutIcon className="h-5 w-5 lg:h-5 lg:w-5 flex-shrink-0" />
                <span>{signOutItem.label}</span>
              </span>
              <i className="nav-button-border"></i>
            </button>
          </form>
          <p className="text-xs text-muted/80 text-center">
            Signed in as staff. Actions here are recorded in the audit log.
          </p>
        </div>
      </aside>
    </>
  );
}
