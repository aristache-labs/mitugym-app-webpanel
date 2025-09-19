import { z } from "zod";

export const planSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Name is required"),
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
});

export type PlanInput = z.infer<typeof planSchema>;
