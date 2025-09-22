import { fetchServiceById } from "@/lib/data";
import { ServiceForm } from "@/components/services/service-form";
import { notFound } from "next/navigation";

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Service",
};

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;
  const service = await fetchServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Service</h1>
        <p className="text-muted-foreground">
          Modify service details and settings
        </p>
      </div>
      
      <ServiceForm service={service} mode="edit" />
    </div>
  );
}
