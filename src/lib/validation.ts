import { z } from "zod";

const kenyanPhone = z
  .string()
  .trim()
  .regex(
    /^(?:\+254|254|0)7\d{8}$|^(?:\+254|254|0)1\d{8}$/,
    "Enter a valid Kenyan phone number, e.g. 0712345678"
  )
  .transform(normalizeKenyanPhone);

export function normalizeKenyanPhone(phone: string) {
  const digits = phone.trim().replace(/\s+/g, "");
  if (digits.startsWith("+254")) return digits.slice(1);
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

export const CURRICULA = [
  "CBC",
  "EIGHT_FOUR_FOUR",
  "IGCSE",
  "AMERICAN",
  "IB",
  "SWAHILI_FOREIGN",
] as const;

export const studentSignupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.email("Enter a valid email"),
  phone: kenyanPhone,
  password: z.string().min(8, "Password must be at least 8 characters"),
  curriculum: z.enum(CURRICULA),
  gradeLevel: z.string().trim().min(1, "Select your grade/level"),
});

export const teacherSignupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.email("Enter a valid email"),
  phone: kenyanPhone,
  password: z.string().min(8, "Password must be at least 8 characters"),
  bio: z.string().trim().max(1000).optional(),
  curricula: z
    .array(z.enum(CURRICULA))
    .min(1, "Select at least one curriculum you can teach"),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const requestPasswordResetSchema = z.object({
  email: z.email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const CBC_GRADE_LEVELS = [
  "PP1",
  "PP2",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

export const EIGHT_FOUR_FOUR_GRADE_LEVELS = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Form 1",
  "Form 2",
  "Form 3",
  "Form 4",
];

// British / Cambridge international system
export const IGCSE_LEVELS = [
  "Year 7",
  "Year 8",
  "Year 9",
  "Year 10 (IGCSE)",
  "Year 11 (IGCSE)",
  "Year 12 (AS Level)",
  "Year 13 (A Level)",
];

// American K-12 system
export const AMERICAN_GRADE_LEVELS = [
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

// International Baccalaureate
export const IB_LEVELS = [
  "PYP 1",
  "PYP 2",
  "PYP 3",
  "PYP 4",
  "PYP 5",
  "MYP 1",
  "MYP 2",
  "MYP 3",
  "MYP 4",
  "MYP 5",
  "DP 1",
  "DP 2",
];

// Swahili for non-native / international learners — proficiency-based, not grade-based
export const SWAHILI_FOREIGN_LEVELS = [
  "Absolute beginner",
  "Beginner",
  "Elementary",
  "Intermediate",
  "Upper intermediate",
  "Advanced",
];

export const GRADE_LEVELS_BY_CURRICULUM: Record<(typeof CURRICULA)[number], string[]> = {
  CBC: CBC_GRADE_LEVELS,
  EIGHT_FOUR_FOUR: EIGHT_FOUR_FOUR_GRADE_LEVELS,
  IGCSE: IGCSE_LEVELS,
  AMERICAN: AMERICAN_GRADE_LEVELS,
  IB: IB_LEVELS,
  SWAHILI_FOREIGN: SWAHILI_FOREIGN_LEVELS,
};
