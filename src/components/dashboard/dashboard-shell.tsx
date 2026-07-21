import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/dashboard/user-menu";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import type { Role } from "@/generated/prisma/client";

export type NavItem = {
  href: string;
  label: string;
};

export function DashboardShell({
  role,
  navItems,
  userName,
  children,
}: {
  role: Role;
  navItems: NavItem[];
  userName: string;
  children: React.ReactNode;
}) {
  const roleLabel =
    role === "STUDENT" ? "Student" : role === "TEACHER" ? "Teacher" : "Admin";

  return (
    <div className="flex min-h-screen flex-col bg-secondary/20">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge variant="secondary">{roleLabel}</Badge>
          </div>
          <DashboardNav navItems={navItems} className="hidden items-center gap-1 md:flex" />
          <UserMenu userName={userName} />
        </div>
        <DashboardNav
          navItems={navItems}
          className="flex items-center gap-1 overflow-x-auto border-t px-4 py-2 md:hidden"
          itemClassName="shrink-0"
        />
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
