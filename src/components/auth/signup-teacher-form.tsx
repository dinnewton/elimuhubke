"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupTeacherAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FieldError } from "@/components/auth/field-error";
import { CURRICULA } from "@/lib/validation";
import { curriculumLabel } from "@/lib/format";

export function SignupTeacherForm() {
  const [state, formAction, pending] = useActionState(signupTeacherAction, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your teacher account</CardTitle>
        <CardDescription>
          Get verified, set your subjects, and start earning weekly payouts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required autoComplete="name" />
            <FieldError messages={state?.fieldErrors?.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
            <FieldError messages={state?.fieldErrors?.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">M-Pesa phone number</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="07XXXXXXXX"
              required
              autoComplete="tel"
            />
            <FieldError messages={state?.fieldErrors?.phone} />
            <p className="text-xs text-muted-foreground">
              This is where your weekly payouts will be sent.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Curricula you can teach</Label>
            <div className="grid grid-cols-2 gap-2">
              {CURRICULA.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <Checkbox name="curricula" value={c} defaultChecked={c === "CBC"} />
                  {curriculumLabel(c)}
                </label>
              ))}
            </div>
            <FieldError messages={state?.fieldErrors?.curricula} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Short bio (optional)</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder="e.g. 6 years teaching Mathematics at secondary level..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
            <FieldError messages={state?.fieldErrors?.password} />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            By creating an account you agree to ElimuHubKE&apos;s{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
