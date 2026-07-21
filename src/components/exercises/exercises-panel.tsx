import { Download, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isBookingParticipant } from "@/lib/booking-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateExerciseForm } from "@/components/exercises/create-exercise-form";
import { SubmitExerciseForm } from "@/components/exercises/submit-exercise-form";
import { formatDateTime } from "@/lib/format";

export async function ExercisesPanel({ bookingId }: { bookingId: string }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      exercises: {
        orderBy: { createdAt: "desc" },
        include: { submissions: { orderBy: { createdAt: "desc" } } },
      },
    },
  });
  if (!booking || !isBookingParticipant(user, booking)) return null;

  const isTeacher = user.teacherProfile?.id === booking.teacherId;
  const isStudent = user.studentProfile?.id === booking.studentId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Exercises</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isTeacher && (
          <div className="rounded-lg bg-secondary/50 p-4">
            <CreateExerciseForm bookingId={booking.id} />
          </div>
        )}

        {booking.exercises.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {isTeacher
              ? "Send an exercise above for your student to work on."
              : "Your teacher hasn't sent any exercises yet."}
          </p>
        )}

        <div className="space-y-4">
          {booking.exercises.map((exercise) => (
            <div key={exercise.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{exercise.title}</p>
                  {exercise.instructions && (
                    <p className="text-sm text-muted-foreground">
                      {exercise.instructions}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Sent {formatDateTime(exercise.createdAt)}
                  </p>
                </div>
                {exercise.fileUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    render={<a href={`/api/exercises/${exercise.id}/download`} />}
                  >
                    <Download className="h-3.5 w-3.5" /> File
                  </Button>
                )}
              </div>

              {exercise.submissions.length > 0 && (
                <div className="space-y-2 border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Student response{exercise.submissions.length > 1 ? "s" : ""}
                  </p>
                  {exercise.submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between gap-3 rounded-md bg-secondary/50 p-2.5"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>
                          {submission.note || "Completed work"} ·{" "}
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(submission.createdAt)}
                          </span>
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        render={
                          <a href={`/api/exercise-submissions/${submission.id}/download`} />
                        }
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {isStudent && <SubmitExerciseForm exerciseId={exercise.id} />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
