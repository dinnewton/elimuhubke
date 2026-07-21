import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getCurrentUser, dashboardPathForRole } from "@/lib/auth";

export async function SiteNav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/#how-it-works" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/#teachers" className="hover:text-foreground">
            For teachers
          </Link>
          <Link href="/#curriculum" className="hover:text-foreground">
            Curricula
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Button size="sm" render={<Link href={dashboardPathForRole(user.role)} />}>
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                Log in
              </Button>
              <Button size="sm" render={<Link href="/signup" />}>
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
