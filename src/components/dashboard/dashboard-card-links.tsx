"use client";

import { SmartLink } from "@/components/ui/smart-link";
import { CardTitle } from "@/components/ui/card";

interface AnnouncementsTitleLinkProps {
  activeCount: number;
}

export function AnnouncementsTitleLink({ activeCount }: AnnouncementsTitleLinkProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <SmartLink href="/news" className="group/title">
              <CardTitle className="text-base sm:text-lg font-semibold text-text group-hover:text-primary group-hover/title:text-primary transition-colors cursor-pointer">
                Announcements
              </CardTitle>
            </SmartLink>
            <p className="text-xs text-muted/70 mt-0.5 hidden sm:block">Important updates and notifications</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs sm:text-sm font-semibold text-text">
            {activeCount} active
          </div>
          <div className="text-xs text-muted/70 hidden sm:block">notices</div>
        </div>
      </div>
    </>
  );
}

interface CheckInsTitleLinkProps {
  recentCount: number;
}

export function CheckInsTitleLink({ recentCount }: CheckInsTitleLinkProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <SmartLink href="/checkins" className="group/title">
            <CardTitle className="text-base sm:text-lg font-semibold text-text group-hover:text-primary group-hover/title:text-primary transition-colors cursor-pointer">
              Latest Check-ins
            </CardTitle>
          </SmartLink>
          <p className="text-xs text-muted/70 mt-0.5 hidden sm:block">Recent gym entries and activity</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs sm:text-sm font-semibold text-text">
          {recentCount} recent
        </div>
      </div>
    </div>
  );
}

