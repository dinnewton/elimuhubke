import { requireRole } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/dashboard/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/teachers", label: "Find teachers" },
  { href: "/student/bookings", label: "My bookings" },
  { href: "/student/documents", label: "Marketplace" },
  { href: "/student/purchases", label: "My library" },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("STUDENT");

  return (
    <DashboardShell role="STUDENT" navItems={navItems} userName={user.name}>
      {children}
    </DashboardShell>
  );
}
