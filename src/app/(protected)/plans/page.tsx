import { PlanManager } from "@/app/(protected)/plans/plan-manager";
import { fetchPlans } from "@/lib/data";

export const metadata = {
  title: "Membership plans",
};

export default async function PlansPage() {
  const plans = await fetchPlans();
  return <PlanManager plans={plans} />;
}
