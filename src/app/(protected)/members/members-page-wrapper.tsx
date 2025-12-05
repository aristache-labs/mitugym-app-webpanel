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
      <section className="relative">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 rounded-2xl sm:rounded-3xl blur-2xl"></div>
        
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-xl shadow-black/15 transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/10 hover:border-secondary/50 overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/2 via-secondary/1 to-primary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
          
          <div className="relative">
            <MembersTable members={filteredMembers} />
          </div>
        </div>
      </section>
    </>
  );
}
