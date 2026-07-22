import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/teacher/profile-form";
import { SubjectPicker } from "@/components/teacher/subject-picker";
import { UploadQualificationForm } from "@/components/teacher/upload-qualification-form";
import { QualificationList } from "@/components/teacher/qualification-list";

const statusVariant = {
  PENDING: "secondary",
  VERIFIED: "default",
  REJECTED: "destructive",
} as const;

export default async function TeacherProfilePage() {
  const user = await requireRole("TEACHER");
  const teacher = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: user.id },
    include: {
      subjects: true,
      qualifications: { orderBy: { createdAt: "desc" } },
    },
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

      {teacher.verificationStatus !== "VERIFIED" && (
        <Card className="border-accent/40 bg-accent/10">
          <CardContent className="p-4 text-sm">
            {teacher.verificationStatus === "PENDING"
              ? "Your account is awaiting verification by ElimuHubKE admins. Upload a qualification document below (certificate, ID, etc.) to help admins verify you faster — you'll appear in student search once verified."
              : "Your verification was rejected. Upload a qualification document below and an admin can review it again."}
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
          <CardTitle className="text-base">Qualification documents</CardTitle>
          <CardDescription>
            Upload certificates, ID, or other credentials for admins to review
            before verifying your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadQualificationForm />
          <QualificationList qualifications={teacher.qualifications} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subjects you teach</CardTitle>
          <CardDescription>
            Rates are set by ElimuHubKE per subject and grade — you&apos;ll see the
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
