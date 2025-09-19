import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Provide a valid email"),
  password: z.string().min(6, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
