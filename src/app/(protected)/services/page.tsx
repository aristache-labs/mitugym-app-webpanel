import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchServices, fetchPurchasedServices } from "@/lib/data";
import { ServicesTable } from "./services-table";
import { PurchasedServicesTable } from "./purchased-services-table";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Services Management",
};

export default async function ServicesPage() {
  const [services, purchasedServices] = await Promise.all([
    fetchServices(),
    fetchPurchasedServices(),
  ]);

  const activeServices = services.filter((service) => service.is_active);
  const approvedServices = purchasedServices.filter((purchase) => purchase.status === "approved");

  return (
    <div className="space-y-6">
      {/* Services Management */}
      <Card className="bg-card/90">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Services ({activeServices.length} active)</CardTitle>
          <Link href="/services/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <ServicesTable services={services} />
        </CardContent>
      </Card>

      {/* Purchased Services Management */}
      <Card className="bg-card/90">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Purchased Services ({approvedServices.length} approved)</CardTitle>
          <Link href="/services/purchased/new">
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Purchase
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <PurchasedServicesTable purchasedServices={purchasedServices} services={services} />
        </CardContent>
      </Card>
    </div>
  );
}
