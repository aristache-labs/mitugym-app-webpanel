import { ServicesTableNew } from "./services-table-new";
import { PurchasedServicesTable } from "./purchased-services-table";
import { fetchServices, fetchPurchasedServices } from "@/lib/data";
import { Briefcase, ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTimeFormat } from "@/lib/timezone";

export const metadata = {
  title: "Services Management",
};

// Disable caching to ensure fresh data
export const revalidate = 0;

export default async function ServicesPage() {
  const [services, purchasedServices, timeFormat] = await Promise.all([
    fetchServices(),
    fetchPurchasedServices(),
    getTimeFormat(),
  ]);

  const activeServices = services.filter((service) => service.is_active);
  const approvedServices = purchasedServices.filter((purchase) => purchase.status === "approved");

  return (
    <div className="space-y-6 overflow-hidden">

      {/* Services Table */}
      <div className="relative animate-fade-in-up">
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 transition-all duration-300 hover:border-surface/60 overflow-hidden rounded-3xl p-6">
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary/10">
                  <Briefcase className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text">Available Services</h2>
                  <p className="text-sm text-muted/70">Manage gym services and pricing</p>
                </div>
              </div>
            </div>
            <ServicesTableNew services={services} />
          </div>
        </div>
      </div>

      {/* Purchased Services Section */}
      <div className="relative animate-scale-in">
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 transition-all duration-300 hover:border-surface/60 overflow-hidden rounded-3xl p-6">
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text">Purchased Services</h2>
                <p className="text-sm text-muted/70">{approvedServices.length} approved purchases</p>
              </div>
            </div>
            <PurchasedServicesTable purchasedServices={purchasedServices} services={services} timeFormat={timeFormat} />
          </div>
        </div>
      </div>
    </div>
  );
}
