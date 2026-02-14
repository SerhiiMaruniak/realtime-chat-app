import * as z from "zod";

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(1, "This field can't be empty")
    .max(64, "This field can't be longer than 64 characters"),
  email: z.email("Should be a valid email"),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .refine((val) => /[A-Z]/.test(val), { message: "Must include an uppercase letter" })
    .refine((val) => /[a-z]/.test(val), { message: "Must include a lowercase letter" })
    .refine((val) => /[0-9]/.test(val), { message: "Must include a number" }),
});

export const SignInSchema = z.object({
  email: z.email("Should be a valid email"),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .refine((val) => /[A-Z]/.test(val), { message: "Must include an uppercase letter" })
    .refine((val) => /[a-z]/.test(val), { message: "Must include a lowercase letter" })
    .refine((val) => /[0-9]/.test(val), { message: "Must include a number" }),
});

export const UpdateProfileSchema = z.object({
  username: z
    .string()
    .min(1, "This field can't be empty")
    .max(64, "This field can't be longer than 64 characters")
    .optional(),
});
