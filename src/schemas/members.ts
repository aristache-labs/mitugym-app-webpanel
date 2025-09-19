import { z } from "zod";

export const memberStatusEnum = z.enum(["active", "inactive", "frozen"]);

export const memberBaseSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z
    .string()
    .min(7, "Phone must be at least 7 characters")
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  status: memberStatusEnum.default("active"),
  plan_id: z
    .string()
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
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
  notes: z
    .string()
    .max(2000, "Notes are limited to 2000 characters")
    .optional()
    .nullable(),
});

export const createMemberSchema = memberBaseSchema.extend({
  password: z
    .string()
    .min(8, "Temporary password must be at least 8 characters")
    .optional(),
});

export const updateMemberSchema = memberBaseSchema.extend({
  id: z.string().uuid("Member id is required"),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
