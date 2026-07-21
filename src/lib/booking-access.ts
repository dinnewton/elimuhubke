import "server-only";
import type { User, StudentProfile, TeacherProfile } from "@/generated/prisma/client";

type UserWithProfiles = User & {
  studentProfile: StudentProfile | null;
  teacherProfile: TeacherProfile | null;
};

export function isBookingParticipant(
  user: UserWithProfiles,
  booking: { studentId: string; teacherId: string }
) {
  if (user.role === "ADMIN") return true;
  if (user.studentProfile?.id === booking.studentId) return true;
  if (user.teacherProfile?.id === booking.teacherId) return true;
  return false;
}
