import type { Curriculum } from "@/generated/prisma/client";

export function formatKES(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-KE", {
    timeStyle: "short",
  }).format(new Date(date));
}

export const CURRICULUM_LABELS: Record<Curriculum, string> = {
  CBC: "CBC",
  EIGHT_FOUR_FOUR: "8-4-4",
  IGCSE: "IGCSE / A-Level",
  AMERICAN: "American",
  IB: "IB",
  SWAHILI_FOREIGN: "Swahili (foreign learners)",
};

export function curriculumLabel(curriculum: Curriculum) {
  return CURRICULUM_LABELS[curriculum];
}
