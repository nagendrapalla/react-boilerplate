import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(5, { message: "Must be 5 or more characters long" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export type FormValues = {
  email: string;
  password: string;
};
