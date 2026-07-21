import { z } from "zod";
import { CURRICULA } from "@/lib/validation";

export const createSubjectSchema = z.object({
  name: z.string().trim().min(2, "Enter a subject name"),
  curriculum: z.enum(CURRICULA),
  gradeLevel: z.string().trim().min(1, "Enter a grade/level"),
  hourlyRateKES: z.coerce.number().int().min(50, "Rate must be at least KES 50"),
});

export const updateRateSchema = z.object({
  subjectId: z.string().min(1),
  hourlyRateKES: z.coerce.number().int().min(50, "Rate must be at least KES 50"),
});

export const commissionSchema = z.object({
  commissionPercent: z.coerce
    .number()
    .min(0, "Must be 0 or higher")
    .max(80, "Must be 80 or lower"),
});
