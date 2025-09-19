import { z } from "zod";

export const scheduleDaySchema = z.object({
  weekday: z.number().int().min(0).max(6),
  opens_at: z
    .string()
    .regex(/^\d{2}:\d{2}$/u, "Use HH:MM format")
    .nullable(),
  closes_at: z
    .string()
    .regex(/^\d{2}:\d{2}$/u, "Use HH:MM format")
    .nullable(),
  is_closed: z.boolean().default(false),
});

export const scheduleSchema = z
  .array(scheduleDaySchema)
  .length(7, "Schedule must include all seven days");

export type ScheduleInput = z.infer<typeof scheduleSchema>;
