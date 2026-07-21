import { notFound } from "next/navigation";
import Link from "next/link";
import { NotebookPen, PenSquare } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ExercisesPanel } from "@/components/exercises/exercises-panel";

export default async function SessionRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const booking = await db.booking.findUnique({
    where: { videoRoomSlug: slug },
    include: {
      student: { include: { user: true } },
      teacher: { include: { user: true } },
      subject: true,
    },
  });
  if (!booking) notFound();

  const isStudent = user.studentProfile?.id === booking.studentId;
  const isTeacher = user.teacherProfile?.id === booking.teacherId;
  if (!isStudent && !isTeacher) notFound();

  if (booking.status !== "CONFIRMED" && booking.status !== "IN_PROGRESS") {
    return (
      <div className="mx-auto max-w-md py-16">
        <Card>
          <CardHeader>
            <CardTitle>Session not available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This session is {booking.status.toLowerCase().replace("_", " ")}
              {booking.status === "AWAITING_PAYMENT" && " — complete payment first"}.
            </p>
            <Button
              render={
                <Link
                  href={
                    isStudent
                      ? `/student/bookings/${booking.id}`
                      : "/teacher/bookings"
                  }
                />
              }
            >
              Back to bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isStudent && !booking.studentJoinedAt) {
    await db.booking.update({
      where: { id: booking.id },
      data: { studentJoinedAt: new Date(), status: "IN_PROGRESS" },
    });
  }
  if (isTeacher && !booking.teacherJoinedAt) {
    await db.booking.update({
      where: { id: booking.id },
      data: { teacherJoinedAt: new Date(), status: "IN_PROGRESS" },
    });
  }

  const roomName = `elimuhubke-${slug}`;
  const displayName = encodeURIComponent(user.name);

  return (
    <div className="flex h-screen flex-col bg-black">
      <div className="flex items-center justify-between gap-4 bg-secondary px-4 py-2 text-sm">
        <span className="truncate">
          {booking.subject.name} — {booking.student.user.name} &amp;{" "}
          {booking.teacher.user.name}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
            <PenSquare className="h-3.5 w-3.5" />
            Whiteboard is in the call toolbar (more options)
          </span>
          <Sheet>
            <SheetTrigger render={<Button size="sm" variant="secondary" className="gap-1.5" />}>
              <NotebookPen className="h-4 w-4" />
              Exercises
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Exercises</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto px-4 pb-4">
                <ExercisesPanel bookingId={booking.id} />
              </div>
            </SheetContent>
          </Sheet>
          <Button size="sm" variant="ghost" render={<Link href="/" />}>
            Leave
          </Button>
        </div>
      </div>
      <iframe
        title="ElimuHubKE live session"
        src={`https://meet.jit.si/${roomName}#userInfo.displayName=%22${displayName}%22`}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="flex-1 border-0"
      />
    </div>
  );
}
