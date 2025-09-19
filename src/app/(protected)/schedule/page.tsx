import { PremiumScheduleEditor } from "@/components/schedule/premium-schedule-editor";
import { fetchSchedule } from "@/lib/data";

export const metadata = {
  title: "Schedule",
};

export default async function SchedulePage() {
  const schedule = await fetchSchedule();
  return (
    <div className="max-w-7xl mx-auto">
      <PremiumScheduleEditor schedule={schedule} />
    </div>
  );
}
