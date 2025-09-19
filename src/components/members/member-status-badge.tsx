import { Badge } from "@/components/ui/badge";
import type { MemberStatus } from "@/types";

const statusMap: Record<MemberStatus, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "destructive" },
  frozen: { label: "Frozen", variant: "warning" },
};

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const { label, variant } = statusMap[status];
  return <Badge variant={variant}>{label}</Badge>;
}
