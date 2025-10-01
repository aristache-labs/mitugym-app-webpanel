import { z } from "zod";

export const newsSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "Title is required"),
  content: z.string().min(1, "Content is required"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  expires_at: z
    .string()
    .optional()
    .nullable()
    .transform((value) => {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return date.toISOString();
    }),
  is_active: z.boolean().optional().default(true),
});

export type NewsInput = z.infer<typeof newsSchema>;
