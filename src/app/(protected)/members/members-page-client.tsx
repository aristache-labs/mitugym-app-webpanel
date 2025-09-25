"use client";

import { MetricCard } from "@/components/dashboard/metric-card";
import { Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import type { Member } from "@/types";

interface MembersPageClientProps {
  members: Member[];
  expiringCount: number;
  onFilterChange: (filter: string) => void;
}

export function MembersPageClient({ members, expiringCount, onFilterChange }: MembersPageClientProps) {
  const handleTotalMembersClick = () => {
    onFilterChange('all');
  };

  const handleActiveMembersClick = () => {
    onFilterChange('active');
  };

  const handleExpiredMembersClick = () => {
    onFilterChange('inactive');
  };

  const handleExpiringMembersClick = () => {
    onFilterChange('expiring');
  };

  return (
    <>
      {/* Premium Metrics Section */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <MetricCard 
          title="Total Members" 
          value={members.length} 
          description="All registered members" 
          icon={Users}
          onClick={handleTotalMembersClick}
        />
        <MetricCard 
          title="Active Members" 
          value={members.filter(m => m.status === 'active').length} 
          description="Currently active plans" 
          icon={UserCheck}
          onClick={handleActiveMembersClick}
        />
        <MetricCard 
          title="Expired Members" 
          value={members.filter(m => m.status === 'inactive').length} 
          description="Plans have expired" 
          icon={UserX}
          onClick={handleExpiredMembersClick}
        />
        <MetricCard 
          title="Expiring This Week" 
          value={expiringCount} 
          description="Plans expiring soon" 
          icon={AlertTriangle}
          onClick={handleExpiringMembersClick}
        />
      </section>
    </>
  );
}
