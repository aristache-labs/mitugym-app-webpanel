import { z } from "zod";

// Service schemas
export const serviceTypeSchema = z.enum(["personal_trainer", "professional_massage"]);

export const serviceBaseSchema = z.object({
  name: z.string().min(1, "Service name is required").max(255, "Service name too long"),
  service_type: serviceTypeSchema,
  session_type: z.string().optional(),
  duration_minutes: z.number().min(15, "Duration must be at least 15 minutes").max(480, "Duration cannot exceed 8 hours"),
  price: z.number().min(0, "Price cannot be negative"),
  description: z.string().optional(),
  requires_advance_booking: z.boolean().default(false),
  advance_booking_hours: z.number().min(0, "Advance booking hours cannot be negative").default(0),
  max_sessions: z.number().min(1, "Max sessions must be at least 1").optional(),
  is_active: z.boolean().default(true),
  display_order: z.number().min(0, "Display order cannot be negative").default(0),
});

export const createServiceSchema = serviceBaseSchema;

export const updateServiceSchema = serviceBaseSchema.partial().extend({
  id: z.string().uuid("Invalid service ID"),
});

// Service booking schemas
export const bookingStatusSchema = z.enum(["upcoming", "completed", "cancelled"]);

export const serviceBookingBaseSchema = z.object({
  service_id: z.string().uuid("Invalid service ID"),
  member_id: z.string().uuid("Invalid member ID"),
  booking_date: z.string().datetime("Invalid booking date"),
  status: bookingStatusSchema.default("upcoming"),
  sessions_remaining: z.number().min(0, "Sessions remaining cannot be negative").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
});

export const createServiceBookingSchema = serviceBookingBaseSchema;

export const updateServiceBookingSchema = serviceBookingBaseSchema.partial().extend({
  id: z.string().uuid("Invalid booking ID"),
});

// Types inferred from schemas
export type CreateServiceRequest = z.infer<typeof createServiceSchema>;
export type UpdateServiceRequest = z.infer<typeof updateServiceSchema>;
export type CreateServiceBookingRequest = z.infer<typeof createServiceBookingSchema>;
export type UpdateServiceBookingRequest = z.infer<typeof updateServiceBookingSchema>;
