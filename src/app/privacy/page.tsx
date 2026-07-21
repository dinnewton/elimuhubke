import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata = { title: "Privacy Policy — Tusome" };

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: 21 July 2026</p>

        <div className="prose prose-sm mt-8 max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground [&>h2]:mt-8 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:text-foreground [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1">
          <p>
            Tusome (&quot;we&quot;, &quot;us&quot;) operates a platform connecting
            students and teachers for live tutoring, revision materials, and
            Swahili lessons. This policy explains what personal data we
            collect, why, and how it&apos;s handled, in line with Kenya&apos;s
            Data Protection Act, 2019.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>Account details: name, email address, phone number, password (stored as a salted hash, never in plain text).</li>
            <li>Profile details: curriculum, grade/level, teacher bio and subjects.</li>
            <li>Payment details: M-Pesa phone number, transaction references and receipts from Safaricom for payments and payouts. We never see or store your M-Pesa PIN.</li>
            <li>Content you upload: revision documents, exercises, and exercise responses.</li>
            <li>Usage data: booking history, session timestamps, and basic device/browser information for security and troubleshooting.</li>
          </ul>

          <h2>How we use it</h2>
          <ul>
            <li>To create and manage your account, and match students with teachers.</li>
            <li>To process M-Pesa payments and weekly teacher payouts via Safaricom&apos;s Daraja API.</li>
            <li>To send account, booking, purchase, and payout emails.</li>
            <li>To keep the platform secure and prevent fraud or abuse.</li>
          </ul>

          <h2>Who we share it with</h2>
          <ul>
            <li><strong>Safaricom (M-Pesa/Daraja)</strong> — to process payments and payouts.</li>
            <li><strong>Jitsi Meet</strong> — live video sessions run on Jitsi&apos;s video infrastructure; session audio/video is not stored by Tusome.</li>
            <li><strong>Our email provider</strong> — to deliver transactional emails (password resets, receipts, payout notices).</li>
            <li><strong>Our cloud hosting and storage providers</strong> — to run the platform and store uploaded documents securely.</li>
          </ul>
          <p>We do not sell your personal data to third parties.</p>

          <h2>Data retention</h2>
          <p>
            We retain account and transaction data for as long as your account
            is active and as required for legal, accounting, or tax
            purposes. You can request deletion of your account by contacting
            us; some records (e.g. payment history) may be retained where
            required by law.
          </p>

          <h2>Your rights</h2>
          <p>
            Under the Data Protection Act, you may request access to,
            correction of, or deletion of your personal data, and may object
            to certain processing. Contact us to exercise these rights.
          </p>

          <h2>Contact</h2>
          <p>Questions about this policy? Reach us at privacy@tusome.com.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
