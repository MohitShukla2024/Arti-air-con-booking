import { z } from "zod";
import {
  nameSchema,
  phoneSchema,
  altPhoneSchema,
  optionalEmailSchema,
  addressSchema,
  citySchema,
  pincodeSchema,
  optionalProblemDescriptionSchema,
} from "./common.schema";
import {
  SERVICE_OPTIONS,
  AC_TYPE_OPTIONS,
  AC_BRAND_OPTIONS,
} from "@/lib/constants";

// SECURITY (M-04): Validate enum fields against an explicit allowlist.
// Previously any non-empty string was accepted, allowing arbitrary data to be
// stored in the database and displayed in admin dashboards without sanitization.
// Zod v4 uses { message: "..." } (not errorMap) for enum error customization.
const serviceTypeEnum = z.enum(SERVICE_OPTIONS as [string, ...string[]], {
  message: "Please select a valid service type.",
});

const acTypeEnum = z.enum(AC_TYPE_OPTIONS as [string, ...string[]], {
  message: "Please select a valid AC type.",
});

const acBrandEnum = z.enum(AC_BRAND_OPTIONS as [string, ...string[]], {
  message: "Please select a valid AC brand.",
});

export const bookingFormSchema = z.object({
  fullName: nameSchema,
  email: optionalEmailSchema,
  mobileNumber: phoneSchema,
  altMobile: altPhoneSchema,
  fullAddress: addressSchema,
  city: citySchema,
  pincode: pincodeSchema,
  serviceType: serviceTypeEnum,
  acType: acTypeEnum,
  acBrand: acBrandEnum,
  problemDescription: optionalProblemDescriptionSchema,
  preferredDateTime: z.string().trim().min(1, "Please select preferred date & time."),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
