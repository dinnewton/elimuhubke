import type { Curriculum } from "@/generated/prisma/client";

// One distinct, friendly color per curriculum — used for badges, card
// accents, and icon tiles throughout the student-facing pages so learners
// can recognize a curriculum at a glance instead of reading text.
export const CURRICULUM_COLORS: Record<
  Curriculum,
  { badge: string; solid: string; ring: string }
> = {
  CBC: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    solid: "bg-emerald-500",
    ring: "ring-emerald-500/30",
  },
  EIGHT_FOUR_FOUR: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    solid: "bg-blue-500",
    ring: "ring-blue-500/30",
  },
  IGCSE: {
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
    solid: "bg-purple-500",
    ring: "ring-purple-500/30",
  },
  AMERICAN: {
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    solid: "bg-orange-500",
    ring: "ring-orange-500/30",
  },
  IB: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    solid: "bg-rose-500",
    ring: "ring-rose-500/30",
  },
  SWAHILI_FOREIGN: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    solid: "bg-amber-500",
    ring: "ring-amber-500/30",
  },
};

// A small, friendly rotation of avatar background colors, picked
// deterministically from a name so the same person always gets the same
// color and a list of avatars reads as varied rather than monochrome.
const AVATAR_PALETTE = [
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
];

export function avatarColorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
