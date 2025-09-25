"use client";

import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Member } from "@/types";
import { User, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  members: Member[];
  description?: string;
}

export function MembersModal({ isOpen, onClose, title, members, description }: MembersModalProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'destructive';
      case 'frozen':
        return 'secondary';
      case 'pending':
        return 'warning';
      case 'suspended':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-4xl">
      <div className="space-y-3">
        {description && (
          <p className="text-sm text-muted/80">{description}</p>
        )}
        
        <div className="text-sm text-muted/70 pb-2 border-b border-surface/20">
          Showing {members.length} member{members.length !== 1 ? 's' : ''}
        </div>

        {members.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary/60" />
            </div>
            <p className="text-sm font-medium text-text">No members found</p>
            <p className="text-xs text-muted/80 mt-1">No members match this criteria</p>
          </div>
        ) : (
          <div className="max-h-[65vh] overflow-y-auto p-1">
            {members.map((member, index) => (
              <div
                key={member.id}
                className={`group relative bg-gradient-to-r from-surface/80 via-surface/60 to-surface/40 border-x border-surface/40 p-4 hover:from-surface/90 hover:via-surface/80 hover:to-surface/60 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:z-10 overflow-hidden ${
                  index === 0 ? 'border-t rounded-t-2xl' : ''
                } ${
                  index === members.length - 1 ? 'border-b rounded-b-2xl' : 'border-b border-surface/20'
                }`}
              >
                {/* Gradient divider for non-last items */}
                {index !== members.length - 1 && (
                  <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-surface/30 to-transparent"></div>
                )}
                {/* Premium background overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                
                {/* Premium border gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                     style={{ 
                       mask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                       WebkitMask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                       WebkitMaskComposite: 'xor',
                       maskComposite: 'exclude',
                       padding: '1px'
                     }}>
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/15 text-primary font-bold text-lg border-2 border-primary/20 group-hover:from-primary/40 group-hover:to-primary/25 group-hover:border-primary/30 transition-all duration-300 shadow-lg">
                        {member.full_name.charAt(0).toUpperCase()}
                      </div>
                      {/* Premium status indicator */}
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-surface shadow-lg ${
                        member.status === 'active' ? 'bg-success' : 
                        member.status === 'inactive' ? 'bg-error' : 
                        member.status === 'pending' ? 'bg-warning' : 
                        member.status === 'frozen' ? 'bg-info' : 'bg-muted'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Link 
                          href={`/members/${member.id}`}
                          className="group/link flex items-center gap-2 hover:gap-3 transition-all duration-200"
                        >
                          <h3 className="font-semibold text-lg text-text truncate group-hover:text-primary group-hover/link:text-primary transition-colors cursor-pointer">
                            {member.full_name}
                          </h3>
                          <ArrowRight className="h-4 w-4 text-muted/60 group-hover/link:text-primary opacity-0 group-hover/link:opacity-100 transition-all duration-200" />
                        </Link>
                        <Badge variant={getStatusVariant(member.status)} className="text-xs capitalize px-3 py-1 font-medium shadow-sm">
                          {member.status}
                        </Badge>
                      </div>
                      
                      {member.plan_name && (
                        <div className="flex items-center gap-2 text-sm text-muted/80">
                          <div className="p-1 rounded-lg bg-primary/10">
                            <Calendar className="h-3 w-3 text-primary/70" />
                          </div>
                          <span className="truncate font-medium">{member.plan_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-6 shrink-0">
                    {member.expires_at && (
                      <div className="bg-gradient-to-br from-surface/80 to-surface/60 rounded-xl px-4 py-3 border border-surface/40 shadow-sm group-hover:from-surface/90 group-hover:to-surface/70 transition-colors">
                        <div className="text-xs font-medium text-muted/70 uppercase tracking-wider">
                          {member.status === 'inactive' ? 'Expired' : 'Expires'}
                        </div>
                        <div className="text-sm font-bold text-text mt-1">{formatDate(member.expires_at)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
