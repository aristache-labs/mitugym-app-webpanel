"use client";

import { useState, useMemo } from "react";
import { MembersPageClient } from "./members-page-client";
import { MembersTable } from "./members-table";
import { getExpiringMembers, debugExpiringCalculation } from "@/lib/expiring-helpers";
import type { Member } from "@/types";

interface MembersPageWrapperProps {
  members: Member[];
  expiringCount: number;
}

export function MembersPageWrapper({ members, expiringCount }: MembersPageWrapperProps) {
  const [currentFilter, setCurrentFilter] = useState<string>('all');

  // Debug: log members and their expiration info
  console.log('=== EXPIRING MEMBERS DEBUG ===');
  console.log('Backend expiring count:', expiringCount);
  console.log('Total members:', members.length);
  
  // Debug each member's expiration calculation
  members.forEach(member => {
    if (member.expires_at) {
      debugExpiringCalculation(member.expires_at, member.full_name, member.status);
    }
  });

  // Filter members based on the current filter
  const filteredMembers = useMemo(() => {
    switch (currentFilter) {
      case 'active':
        return members.filter(m => m.status === 'active');
      case 'expired':
        return members.filter(m => m.status === 'expired');
      case 'expiring':
        // Use the helper function to ensure consistency with backend
        const expiringMembers = getExpiringMembers(members, 7);
        console.log('Client-side expiring members found:', expiringMembers.length);
        console.log('Expiring members:', expiringMembers.map(m => m.full_name));
        return expiringMembers;
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
