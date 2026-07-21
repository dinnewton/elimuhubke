import Link from "next/link";
import { GraduationCap, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupChooserPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Join Tusome</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us which side of the classroom you&apos;re on.
        </p>
      </div>
      <div className="grid gap-4">
        <Link href="/signup/student">
          <Card className="transition hover:border-primary hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold">I&apos;m a student</p>
                <p className="text-sm text-muted-foreground">
                  Book teachers and buy revision materials.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/signup/teacher">
          <Card className="transition hover:border-primary hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                <GraduationCap className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold">I&apos;m a teacher</p>
                <p className="text-sm text-muted-foreground">
                  Teach live sessions and sell your notes.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
