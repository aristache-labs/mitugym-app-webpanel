import { z } from "zod";

export const planTypeEnum = z.enum(["day_entry", "full", "student"]);

export const planSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Name is required"),
  plan_type: planTypeEnum.default("full"),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price cannot be negative"),
  duration_months: z.coerce
    .number({ invalid_type_error: "Duration must be a number" })
    .min(0, "Duration cannot be negative"),
  features: z
    .array(z.string())
    .optional()
    .default([]),
  is_active: z.coerce.boolean().optional().default(true),
  display_order: z.coerce
    .number({ invalid_type_error: "Display order must be a number" })
    .min(0, "Display order cannot be negative")
    .optional(),
});

export type PlanInput = z.infer<typeof planSchema>;
