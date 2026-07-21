import { requireRole } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/dashboard/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/profile", label: "Profile" },
  { href: "/teacher/availability", label: "Availability" },
  { href: "/teacher/bookings", label: "Bookings" },
  { href: "/teacher/documents", label: "My documents" },
  { href: "/teacher/earnings", label: "Earnings" },
];

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("TEACHER");

  return (
    <DashboardShell role="TEACHER" navItems={navItems} userName={user.name}>
      {children}
    </DashboardShell>
  );
}
