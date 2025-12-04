import { PremiumScheduleEditor } from "@/components/schedule/premium-schedule-editor";
import { fetchSchedule } from "@/lib/data";
import { getTimeFormat } from "@/lib/timezone";

export const metadata = {
  title: "Schedule",
};

export default async function SchedulePage() {
  const [schedule, timeFormat] = await Promise.all([
    fetchSchedule(),
    getTimeFormat(),
  ]);
  return (
    <div className="max-w-7xl mx-auto px-0">
      <PremiumScheduleEditor schedule={schedule} timeFormat={timeFormat} />
    </div>
  );
}
