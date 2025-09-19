import { CheckinsWithTabs } from "@/components/checkins/checkins-with-tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchCheckIns, fetchOccupancy } from "@/lib/data";

export const metadata = {
  title: "Check-ins",
};

export default async function CheckinsPage() {
  const [checkIns, occupancy] = await Promise.all([fetchCheckIns(), fetchOccupancy()]);
  return (
    <div className="space-y-6">
      <Card className="bg-card/90">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg">In Gym Now</CardTitle>
          <Badge variant="success" className="text-4xl px-6 py-3 font-bold">
            {occupancy.total}
          </Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted">
          Live count of people currently in the gym, updated every few seconds based on floor scanners and manual overrides. Use this card to monitor current capacity.
        </CardContent>
      </Card>
      <CheckinsWithTabs data={checkIns} />
    </div>
  );
}
