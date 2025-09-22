import { ServiceForm } from "@/components/services/service-form";

export const metadata = {
  title: "New Service",
};

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Service</h1>
        <p className="text-muted-foreground">
          Add a new service to your gym offerings
        </p>
      </div>
      
      <ServiceForm mode="create" />
    </div>
  );
}
