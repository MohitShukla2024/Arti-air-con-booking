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

export const bookingFormSchema = z.object({
  fullName: nameSchema,
  email: optionalEmailSchema,
  mobileNumber: phoneSchema,
  altMobile: altPhoneSchema,
  fullAddress: addressSchema,
  city: citySchema,
  pincode: pincodeSchema,
  serviceType: z.string().trim().min(1, "Please select a service type."),
  acType: z.string().trim().min(1, "Please select an AC type."),
  acBrand: z.string().trim().min(1, "Please select an AC brand."),
  problemDescription: optionalProblemDescriptionSchema,
  preferredDateTime: z.string().trim().min(1, "Please select preferred date & time."),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
