import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata = { title: "Terms of Service — ElimuHubKE" };

export default function TermsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: 21 July 2026</p>

        <div className="prose prose-sm mt-8 max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground [&>h2]:mt-8 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:text-foreground [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1">
          <p>
            These terms govern your use of ElimuHubKE. By creating an account,
            you agree to them.
          </p>

          <h2>The platform</h2>
          <p>
            ElimuHubKE connects students with independent teachers for live
            tutoring, revision materials, and Swahili lessons, across CBC,
            8-4-4, IGCSE, American, and IB curricula. Teachers set their own
            availability and teaching content; ElimuHubKE sets hourly rates and
            facilitates booking, payment, and payout.
          </p>

          <h2>Accounts</h2>
          <ul>
            <li>You must provide accurate information and keep your login credentials confidential.</li>
            <li>Teacher accounts are subject to verification before appearing in student search results.</li>
            <li>We may suspend or terminate accounts that violate these terms or misuse the platform.</li>
          </ul>

          <h2>Payments</h2>
          <ul>
            <li>Student payments (bookings and document purchases) are processed via M-Pesa STK Push.</li>
            <li>Teacher payouts are calculated weekly from completed sessions and document sales, minus ElimuHubKE&apos;s commission, and sent via M-Pesa.</li>
            <li>Rates for tutoring sessions are set by ElimuHubKE per subject and grade/level and are not negotiable between students and teachers.</li>
            <li>Refunds for failed or disputed sessions are handled case-by-case — contact support.</li>
          </ul>

          <h2>Conduct</h2>
          <ul>
            <li>Sessions and materials must be lawful, accurate, and appropriate for the stated audience.</li>
            <li>Uploaded documents must be original or appropriately licensed content.</li>
            <li>Harassment, fraud, or attempts to circumvent platform payments are prohibited and may result in account termination.</li>
          </ul>

          <h2>Live sessions</h2>
          <p>
            Live video sessions run on third-party video infrastructure
            (Jitsi Meet). ElimuHubKE is not responsible for interruptions caused
            by that infrastructure, your internet connection, or device.
          </p>

          <h2>Liability</h2>
          <p>
            ElimuHubKE facilitates connections between independent teachers and
            students but does not guarantee learning outcomes. The platform
            is provided &quot;as is&quot;. To the extent permitted by law,
            ElimuHubKE&apos;s liability is limited to amounts paid through the
            platform in the preceding 3 months.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of
            ElimuHubKE after changes take effect constitutes acceptance.
          </p>

          <h2>Contact</h2>
          <p>Questions? Reach us at support@elimuhubke.com.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
