import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Kenyan and international learners, connected with teachers — CBC,
            8-4-4, IGCSE, American, IB, and Swahili for visitors — paid
            safely with M-Pesa.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p className="font-medium text-foreground">Platform</p>
            <Link href="/signup/student" className="block hover:text-foreground">
              Join as a student
            </Link>
            <Link href="/signup/teacher" className="block hover:text-foreground">
              Join as a teacher
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Account</p>
            <Link href="/login" className="block hover:text-foreground">
              Log in
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Tusome. Made for Kenyan classrooms.
      </div>
    </footer>
  );
}
