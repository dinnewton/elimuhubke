import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CommissionForm } from "@/components/admin/commission-form";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide business rules.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Commission</CardTitle>
          <CardDescription>
            Percentage ElimuHubKE keeps from every teacher&apos;s tutoring hours and
            document sales before the weekly M-Pesa payout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommissionForm currentPercent={settings.commissionPercent} />
        </CardContent>
      </Card>
    </div>
  );
}
