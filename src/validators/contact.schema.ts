import { z } from "zod";
import { nameSchema, phoneSchema, emailSchema } from "./common.schema";
import { sanitizeString } from "@/lib/sanitizer";

export const contactFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  message: z
    .string()
    .transform((val) => sanitizeString(val))
    .pipe(
      z
        .string()
        .min(10, "Message must be at least 10 characters.")
        .max(500, "Message must not exceed 500 characters.")
    ),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
