import { CheckinsTable } from "@/app/(protected)/checkins/checkins-table";
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
          <CardTitle className="text-lg">Occupancy now</CardTitle>
          <Badge variant="success" className="text-base">
            {occupancy.total} {occupancy.capacity ? `/ ${occupancy.capacity}` : ""}
          </Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted">
          Occupancy updates every few seconds based on the floor scanners and manual overrides. Use this card to manage peak
          hours.
        </CardContent>
      </Card>
      <CheckinsTable data={checkIns} />
    </div>
  );
}
