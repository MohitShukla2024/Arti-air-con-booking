import { z } from "zod";
import {
  nameSchema,
  phoneSchema,
  emailSchema,
  optionalEmailSchema,
  passwordSchema,
  otpCodeSchema,
} from "./common.schema";

/** Customer Login Schema */
export const customerLoginSchema = z.object({
  mobileNumber: phoneSchema,
  password: z.string().min(1, "Password is required."),
});

/** Customer Signup Schema */
export const customerSignupSchema = z
  .object({
    fullName: nameSchema,
    mobileNumber: phoneSchema,
    email: optionalEmailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
    terms: z
      .boolean()
      .refine((val) => val === true, "You must accept the Terms of Service and Privacy Policy."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/** Admin Signup Schema */
export const adminSignupSchema = z
  .object({
    fullName: nameSchema,
    mobileNumber: phoneSchema,
    adminEmail: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/** Admin Login Schema */
export const adminLoginSchema = z.object({
  adminId: z
    .string()
    .trim()
    .min(3, "Admin ID or Email must be at least 3 characters."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().optional(),
});

/** Send OTP / Forgot Password Schema */
export const forgotPasswordSchema = z.object({
  mobileNumber: phoneSchema,
});

/** Verify OTP Schema */
export const otpVerifySchema = z.object({
  otp: otpCodeSchema,
});

export type CustomerLoginValues = z.infer<typeof customerLoginSchema>;
export type CustomerSignupValues = z.infer<typeof customerSignupSchema>;
export type AdminSignupValues = z.infer<typeof adminSignupSchema>;
export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type OTPVerifyValues = z.infer<typeof otpVerifySchema>;
