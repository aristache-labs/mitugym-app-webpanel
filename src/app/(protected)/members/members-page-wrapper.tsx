"use client";

import { useState, useMemo } from "react";
import { MembersPageClient } from "./members-page-client";
import { MembersTable } from "./members-table";
import type { Member } from "@/types";

interface MembersPageWrapperProps {
  members: Member[];
  expiringCount: number;
}

export function MembersPageWrapper({ members, expiringCount }: MembersPageWrapperProps) {
  const [currentFilter, setCurrentFilter] = useState<string>('all');

  // Filter members based on the current filter
  const filteredMembers = useMemo(() => {
    switch (currentFilter) {
      case 'active':
        return members.filter(m => m.status === 'active');
      case 'inactive':
        return members.filter(m => m.status === 'inactive');
      case 'expiring':
        // Filter members expiring in the next 7 days using configurable timezone
        // Note: This will need to be async, but for now filtering is done server-side
        return members.filter((member) => {
          if (!member.expires_at) return false;
          // Simple client-side fallback - this will be replaced with server-side filtering
          const expires = new Date(member.expires_at).getTime();
          const now = new Date().getTime();
          const week = 7 * 24 * 60 * 60 * 1000;
          return expires - now <= week && expires > now;
        });
      case 'all':
      default:
        return members;
    }
  }, [members, currentFilter]);

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  return (
    <>
      <MembersPageClient 
        members={members} 
        expiringCount={expiringCount} 
        onFilterChange={handleFilterChange}
      />

      {/* Members Table */}
      <section>
        <MembersTable members={filteredMembers} />
      </section>
    </>
  );
}
