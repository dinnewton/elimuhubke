import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  ShieldCheck,
  Smartphone,
  Wallet,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent"
            aria-hidden
          />
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
            <div className="space-y-6">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                CBC · 8-4-4 · IGCSE · American · IB · Swahili
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Learn Kenya&apos;s curriculum — or Swahili — live, with
                teachers you trust.
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground text-pretty">
                Tusome connects students across CBC, 8-4-4, IGCSE, American
                and IB curricula with verified teachers for live, hourly
                tutoring — plus Swahili lessons for international visitors
                and expats, and a marketplace of notes and past papers. Pay
                with M-Pesa. Teachers get paid weekly.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="gap-2" render={<Link href="/signup/student" />}>
                  Find a teacher <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" render={<Link href="/signup/teacher" />}>
                  Teach on Tusome
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Verified teachers
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  M-Pesa payments
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="border-primary/20 shadow-xl shadow-primary/10">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      Upcoming session
                    </p>
                    <Badge>CONFIRMED</Badge>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      Mathematics — Grade 8 (CBC)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      with Faith W. · Today, 4:00 PM – 5:00 PM
                    </p>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                    <span className="text-sm text-muted-foreground">
                      Session rate (1 hr)
                    </span>
                    <span className="font-semibold">KES 800</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <span className="flex items-center gap-2 text-sm">
                      <Smartphone className="h-4 w-4 text-primary" /> M-Pesa
                      STK Push sent
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Enter PIN to confirm
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t bg-secondary/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight">
                How Tusome works
              </h2>
              <p className="mt-3 text-muted-foreground">
                Three steps from “I don&apos;t get this topic” to a confirmed
                session with a real teacher.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: BookOpenCheck,
                  title: "Pick your curriculum & subject",
                  body: "CBC, 8-4-4, IGCSE, American, IB, or conversational Swahili — filter by curriculum and the exact subject or level you need.",
                },
                {
                  icon: CalendarCheck,
                  title: "Book an hourly slot",
                  body: "See a teacher's open availability and book the hour that works — rates are fixed by Tusome, so pricing is always fair.",
                },
                {
                  icon: Video,
                  title: "Pay with M-Pesa & join live",
                  body: "Confirm with an STK push, then join your teacher on a live video session right in your browser.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <Card key={title} className="border-none bg-background shadow-sm">
                  <CardContent className="space-y-3 p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Curriculum coverage */}
        <section id="curriculum" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight">
                Every learner, every curriculum
              </h2>
              <p className="mt-3 text-muted-foreground">
                Local and international curricula, plus Swahili lessons for
                visitors, expats, and the diaspora — matched to your exact
                grade, form, year, or level.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  badge: "CBC",
                  title: "PP1 – Grade 12",
                  body: "Junior & Senior School subjects, aligned to KICD competencies.",
                },
                {
                  badge: "8-4-4",
                  title: "Class 1 – Form 4",
                  body: "KCPE & KCSE-focused tutoring and past-paper practice.",
                },
                {
                  badge: "IGCSE / A-Level",
                  title: "Year 7 – Year 13",
                  body: "British & Cambridge international school subjects.",
                },
                {
                  badge: "American",
                  title: "Kindergarten – Grade 12",
                  body: "US curriculum support for international & homeschool students.",
                },
                {
                  badge: "IB",
                  title: "PYP · MYP · DP",
                  body: "Primary through Diploma Programme tutoring and exam prep.",
                },
                {
                  badge: "Swahili",
                  title: "Beginner – Advanced",
                  body: "Conversational and practical Swahili for visitors, expats, and diaspora.",
                },
              ].map(({ badge, title, body }) => (
                <Card key={badge}>
                  <CardContent className="space-y-2 p-6">
                    <Badge variant="secondary">{badge}</Badge>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* For teachers */}
        <section id="teachers" className="border-t bg-secondary/30 py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight">
                Teach, get booked, get paid — every week.
              </h2>
              <p className="text-muted-foreground">
                Set your availability and upload revision materials. Tusome
                sets fair hourly rates per subject and grade so you never
                have to negotiate. Every Monday, your earnings from the
                past week — tutoring hours and document sales, minus our
                commission — are sent straight to your M-Pesa line.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Weekly automatic M-Pesa payouts, transparent commission.
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Verified teacher badge builds trust with parents & students.
                </li>
                <li className="flex items-start gap-3">
                  <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Sell your notes and past papers alongside live sessions.
                </li>
              </ul>
              <Button size="lg" className="gap-2" render={<Link href="/signup/teacher" />}>
                Apply to teach <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <Card className="shadow-xl">
              <CardContent className="space-y-4 p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  This week&apos;s earnings
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tutoring — 6.5 hrs</span>
                    <span className="font-medium">KES 5,200</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Document sales — 9</span>
                    <span className="font-medium">KES 1,350</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
                    <span>Platform commission (20%)</span>
                    <span>− KES 1,310</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4 font-semibold text-primary">
                    <span>Paid to M-Pesa on Monday</span>
                    <span>KES 5,240</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl rounded-2xl bg-primary px-8 py-14 text-center text-primary-foreground">
            <h2 className="text-3xl font-semibold tracking-tight">
              Ready to learn, or ready to teach?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
              Join Tusome today — set up takes less than two minutes.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" render={<Link href="/signup/student" />}>
                I&apos;m a student
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                render={<Link href="/signup/teacher" />}
              >
                I&apos;m a teacher
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
