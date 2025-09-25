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
        // Filter members expiring in the next 7 days (using Romania timezone)
        // This exactly matches the backend logic in fetchExpiringMembersCount
        return members.filter((member) => {
          if (!member.expires_at) return false;
          
          const expires = new Date(member.expires_at).getTime();
          const romaniaTime = new Date().getTime() + (3 * 60 * 60 * 1000); // Add 3 hours for UTC+3
          const week = 1000 * 60 * 60 * 24 * 7;
          
          // Include members expiring within 7 days (including exactly 7 days)
          const isExpiringThisWeek = expires - romaniaTime <= week && expires > romaniaTime;
          
          return isExpiringThisWeek;
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
