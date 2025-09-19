import { z } from "zod";

export const checkInFilterSchema = z.object({
  member: z.string().optional(),
  method: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type CheckInFilterInput = z.infer<typeof checkInFilterSchema>;
