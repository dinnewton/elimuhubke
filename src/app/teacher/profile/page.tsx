import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/teacher/profile-form";
import { SubjectPicker } from "@/components/teacher/subject-picker";

const statusVariant = {
  PENDING: "secondary",
  VERIFIED: "default",
  REJECTED: "destructive",
} as const;

export default async function TeacherProfilePage() {
  const user = await requireRole("TEACHER");
  const teacher = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: user.id },
    include: { subjects: true },
  });

  const availableSubjects = await db.subject.findMany({
    where: { curriculum: { in: teacher.curricula } },
    orderBy: [{ curriculum: "asc" }, { gradeLevel: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.email} · {user.phone}
          </p>
        </div>
        <Badge variant={statusVariant[teacher.verificationStatus]}>
          {teacher.verificationStatus}
        </Badge>
      </div>

      {teacher.verificationStatus === "PENDING" && (
        <Card className="border-accent/40 bg-accent/10">
          <CardContent className="p-4 text-sm">
            Your account is awaiting verification by Tusome admins. You can set
            up your profile and subjects in the meantime — you&apos;ll appear
            in student search once verified.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About you</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm bio={teacher.bio} mpesaPayoutPhone={teacher.mpesaPayoutPhone} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subjects you teach</CardTitle>
          <CardDescription>
            Rates are set by Tusome per subject and grade — you&apos;ll see the
            rate on each booking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectPicker
            availableSubjects={availableSubjects}
            mySubjectIds={teacher.subjects.map((s) => s.subjectId)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
