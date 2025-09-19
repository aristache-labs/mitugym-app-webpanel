import { StaffContext } from "@/lib/auth";
import { format } from "date-fns";

export function Topbar({ staff }: { staff: StaffContext }) {
  const now = format(new Date(), "EEEE, MMM d");
  return (
    <header className="flex items-center justify-between rounded-[20px] border border-surface/40 bg-surface/40 px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-muted">Welcome back</p>
        <p className="text-lg font-semibold text-text">{staff.profile.full_name ?? staff.user.email}</p>
      </div>
      <div className="text-right text-xs text-muted">{now}</div>
    </header>
  );
}
