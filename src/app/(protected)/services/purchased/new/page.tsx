import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PurchaseForm } from "./purchase-form";
import { fetchServices, fetchMembers } from "@/lib/data";

export const metadata = {
  title: "New Purchase",
};

export default async function NewPurchasePage() {
  const [services, members] = await Promise.all([
    fetchServices(),
    fetchMembers(),
  ]);

  // Only show active services
  const activeServices = services.filter((service) => service.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/services">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">New Purchase</h1>
      </div>

      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>Create New Service Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseForm services={activeServices} members={members} />
        </CardContent>
      </Card>
    </div>
  );
}
