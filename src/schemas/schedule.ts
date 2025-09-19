import { z } from "zod";

export const scheduleDaySchema = z.object({
  weekday: z.number().int().min(0).max(6),
  opens_at: z
    .string()
    .regex(/^\d{2}:\d{2}$/u, "Use HH:MM format")
    .nullable()
    .optional(),
  closes_at: z
    .string()
    .regex(/^\d{2}:\d{2}$/u, "Use HH:MM format")
    .nullable()
    .optional(),
  is_closed: z.boolean().default(false),
}).refine((data) => {
  // If the day is not closed, both opens_at and closes_at must be valid
  if (!data.is_closed) {
    return data.opens_at && data.closes_at && 
           /^\d{2}:\d{2}$/u.test(data.opens_at) && 
           /^\d{2}:\d{2}$/u.test(data.closes_at);
  }
  // If the day is closed, times can be null/undefined
  return true;
}, {
  message: "Open days must have valid opening and closing times",
  path: ["opens_at"], // This will show the error on the opens_at field
});

export const scheduleSchema = z
  .array(scheduleDaySchema)
  .length(7, "Schedule must include all seven days");

export type ScheduleInput = z.infer<typeof scheduleSchema>;
