"use client";

import { useState, useMemo } from "react";
import { MembersPageClient } from "./members-page-client";
import { MembersTable } from "./members-table";
import { getExpiringMembers } from "@/lib/expiring-helpers";
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
      case 'expired':
        return members.filter(m => m.status === 'expired');
      case 'expiring':
        // Use the helper function to ensure consistency with backend
        const expiringMembers = getExpiringMembers(members, 7);
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
      <div className="animate-scale-in">
      <MembersPageClient 
        members={members} 
        expiringCount={expiringCount} 
        onFilterChange={handleFilterChange}
      />
      </div>

      {/* Members Table */}
      <section className="relative animate-fade-in-up">
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 transition-all duration-300 hover:border-surface/60 overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <div className="relative">
            <MembersTable members={filteredMembers} />
          </div>
        </div>
      </section>
    </>
  );
}
