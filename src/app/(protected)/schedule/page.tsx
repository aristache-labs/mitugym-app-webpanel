import { ScheduleEditor } from "@/components/schedule/schedule-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchSchedule } from "@/lib/data";

export const metadata = {
  title: "Schedule",
};

export default async function SchedulePage() {
  const schedule = await fetchSchedule();
  return (
    <div className="space-y-6">
      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>Weekly schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleEditor schedule={schedule} />
        </CardContent>
      </Card>
      <p className="text-xs text-muted">
        Changes sync to the member booking system and signage screens. Scanner validations reference these hours.
      </p>
    </div>
  );
}
