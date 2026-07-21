import { requireRole } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/dashboard/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/subjects", label: "Subjects & rates" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("ADMIN");

  return (
    <DashboardShell role="ADMIN" navItems={navItems} userName={user.name}>
      {children}
    </DashboardShell>
  );
}
