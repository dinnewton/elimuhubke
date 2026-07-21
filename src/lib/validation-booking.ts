import { z } from "zod";
import { normalizeKenyanPhone } from "@/lib/validation";

const kenyanPhone = z
  .string()
  .trim()
  .regex(
    /^(?:\+254|254|0)7\d{8}$|^(?:\+254|254|0)1\d{8}$/,
    "Enter a valid Kenyan phone number, e.g. 0712345678"
  )
  .transform(normalizeKenyanPhone);

export const createBookingSchema = z.object({
  availabilityId: z.string().min(1),
  subjectId: z.string().min(1),
  phone: kenyanPhone,
});

export const purchaseDocumentSchema = z.object({
  documentId: z.string().min(1),
  phone: kenyanPhone,
});

export const addAvailabilitySchema = z
  .object({
    startsAt: z.string().min(1, "Pick a start time"),
    endsAt: z.string().min(1, "Pick an end time"),
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: "End time must be after start time",
    path: ["endsAt"],
  })
  .refine((data) => new Date(data.startsAt) > new Date(), {
    message: "Start time must be in the future",
    path: ["startsAt"],
  });

export const uploadDocumentSchema = z.object({
  subjectId: z.string().min(1, "Choose a subject"),
  title: z.string().trim().min(3, "Enter a title"),
  description: z.string().trim().max(2000).optional(),
  priceKES: z.coerce.number().int().min(20, "Price must be at least KES 20"),
});

export const teacherProfileSchema = z.object({
  bio: z.string().trim().max(1000).optional(),
  mpesaPayoutPhone: kenyanPhone.optional().or(z.literal("")),
});

export const createExerciseSchema = z.object({
  bookingId: z.string().min(1),
  title: z.string().trim().min(3, "Enter a title"),
  instructions: z.string().trim().max(2000).optional(),
});

export const submitExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  note: z.string().trim().max(1000).optional(),
});
