"use client";

import { useState } from "react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MembersModal } from "@/components/members/members-modal";
import { Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import type { Member } from "@/types";

interface MembersPageClientProps {
  members: Member[];
  expiringCount: number;
}

export function MembersPageClient({ members, expiringCount }: MembersPageClientProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    members: Member[];
  }>({
    isOpen: false,
    title: "",
    description: "",
    members: [],
  });

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const openActiveMembers = () => {
    const activeMembers = members.filter(m => m.status === 'active');
    setModalState({
      isOpen: true,
      title: "Active Members",
      description: "Members with currently active plans",
      members: activeMembers,
    });
  };

  const openExpiredMembers = () => {
    const expiredMembers = members.filter(m => m.status === 'inactive');
    setModalState({
      isOpen: true,
      title: "Expired Members",
      description: "Members whose plans have expired",
      members: expiredMembers,
    });
  };

  const openExpiringMembers = () => {
    // Filter members expiring in the next 7 days (using Romania timezone)
    const expiringMembers = members.filter((member) => {
      if (!member.expires_at) return false;
      const expires = new Date(member.expires_at).getTime();
      const romaniaTime = new Date().getTime() + (3 * 60 * 60 * 1000); // Add 3 hours for UTC+3
      const week = 1000 * 60 * 60 * 24 * 7;
      return expires - romaniaTime < week && expires > romaniaTime;
    });
    
    setModalState({
      isOpen: true,
      title: "Expiring This Week",
      description: "Members whose plans expire within the next 7 days",
      members: expiringMembers,
    });
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
        />
        <MetricCard 
          title="Active Members" 
          value={members.filter(m => m.status === 'active').length} 
          description="Currently active plans" 
          icon={UserCheck}
          onClick={openActiveMembers}
        />
        <MetricCard 
          title="Expired Members" 
          value={members.filter(m => m.status === 'inactive').length} 
          description="Plans have expired" 
          icon={UserX}
          onClick={openExpiredMembers}
        />
        <MetricCard 
          title="Expiring This Week" 
          value={expiringCount} 
          description="Plans expiring soon" 
          icon={AlertTriangle}
          onClick={openExpiringMembers}
        />
      </section>

      <MembersModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        description={modalState.description}
        members={modalState.members}
      />
    </>
  );
}
