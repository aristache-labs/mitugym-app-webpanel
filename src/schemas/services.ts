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
export const bookingStatusSchema = z.enum(["pending", "confirmed", "upcoming", "completed", "cancelled"]);

export const serviceBookingBaseSchema = z.object({
  purchased_service_id: z.string().uuid("Invalid purchased service ID"),
  member_id: z.string().uuid("Invalid member ID"),
  booking_date: z.string().min(1, "Booking date is required").refine(
    (val) => {
      // Allow both datetime-local format (YYYY-MM-DDTHH:mm) and ISO format
      const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return datetimeLocalRegex.test(val) || isoRegex.test(val) || !isNaN(Date.parse(val));
    },
    { message: "Invalid booking date format" }
  ),
  status: bookingStatusSchema.default("upcoming"),
  sessions_remaining: z.number().min(0, "Sessions remaining cannot be negative").optional(),
  notes: z.string().max(1000, "Notes too long").optional().nullable(),
});

export const createServiceBookingSchema = serviceBookingBaseSchema;

export const updateServiceBookingSchema = serviceBookingBaseSchema.partial().extend({
  id: z.string().uuid("Invalid booking ID"),
});

// Purchased service schemas
export const purchasedServiceStatusSchema = z.enum(["pending", "approved", "cancelled"]);

export const approvePurchasedServiceSchema = z.object({
  id: z.string().uuid("Invalid purchased service ID"),
  notes: z.string().max(1000, "Notes too long").optional(),
});

export const cancelPurchasedServiceSchema = z.object({
  id: z.string().uuid("Invalid purchased service ID"),
  reason: z.string().min(1, "Cancellation reason is required").max(1000, "Reason too long"),
});

export const deletePurchasedServiceSchema = z.object({
  id: z.string().uuid("Invalid purchased service ID"),
});

export const createPurchasedServiceSchema = z.object({
  member_id: z.string().uuid("Please select a member"),
  service_id: z.string().uuid("Please select a service"),
  sessions_total: z.coerce
    .number({ invalid_type_error: "Sessions must be a number" })
    .min(1, "At least 1 session is required")
    .max(100, "Maximum 100 sessions allowed"),
  notes: z.string().max(1000, "Notes too long").optional(),
});

export const confirmSessionBookingSchema = z.object({
  id: z.string().uuid("Invalid booking ID"),
  notes: z.string().max(1000, "Notes too long").optional(),
});

export const completeSessionBookingSchema = z.object({
  id: z.string().uuid("Invalid booking ID"),
  notes: z.string().max(1000, "Notes too long").optional(),
});

export const cancelSessionBookingSchema = z.object({
  id: z.string().uuid("Invalid booking ID"),
  reason: z.string().min(1, "Cancellation reason is required").max(1000, "Reason too long"),
});

export const updateSessionBookingSchema = z.object({
  id: z.string().uuid("Invalid booking ID"),
  booking_date: z.string().min(1, "Booking date is required").refine(
    (val) => {
      // Allow both datetime-local format (YYYY-MM-DDTHH:mm) and ISO format
      const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return datetimeLocalRegex.test(val) || isoRegex.test(val) || !isNaN(Date.parse(val));
    },
    { message: "Invalid booking date format" }
  ),
  status: bookingStatusSchema.optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
});

// Types inferred from schemas
export type CreateServiceRequest = z.infer<typeof createServiceSchema>;
export type UpdateServiceRequest = z.infer<typeof updateServiceSchema>;
export type CreateServiceBookingRequest = z.infer<typeof createServiceBookingSchema>;
export type UpdateServiceBookingRequest = z.infer<typeof updateServiceBookingSchema>;
export type ApprovePurchasedServiceRequest = z.infer<typeof approvePurchasedServiceSchema>;
export type CancelPurchasedServiceRequest = z.infer<typeof cancelPurchasedServiceSchema>;
export type DeletePurchasedServiceRequest = z.infer<typeof deletePurchasedServiceSchema>;
export type CreatePurchasedServiceRequest = z.infer<typeof createPurchasedServiceSchema>;
export type ConfirmSessionBookingRequest = z.infer<typeof confirmSessionBookingSchema>;
export type CompleteSessionBookingRequest = z.infer<typeof completeSessionBookingSchema>;
export type CancelSessionBookingRequest = z.infer<typeof cancelSessionBookingSchema>;
export type UpdateSessionBookingRequest = z.infer<typeof updateSessionBookingSchema>;
