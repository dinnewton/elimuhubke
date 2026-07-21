"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signupStudentAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FieldError } from "@/components/auth/field-error";
import { CURRICULA, GRADE_LEVELS_BY_CURRICULUM } from "@/lib/validation";
import { CURRICULUM_LABELS, curriculumLabel } from "@/lib/format";
import type { Curriculum } from "@/generated/prisma/client";

export function SignupStudentForm() {
  const [state, formAction, pending] = useActionState(signupStudentAction, null);
  const [curriculum, setCurriculum] = useState<Curriculum>("CBC");
  const gradeLevels = GRADE_LEVELS_BY_CURRICULUM[curriculum];
  const levelLabel = curriculum === "SWAHILI_FOREIGN" ? "Level" : "Grade / Form";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your student account</CardTitle>
        <CardDescription>Find teachers matched to your grade level.</CardDescription>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="curriculum">Curriculum</Label>
              <Select
                name="curriculum"
                defaultValue="CBC"
                items={CURRICULUM_LABELS}
                onValueChange={(value) => setCurriculum(value as Curriculum)}
              >
                <SelectTrigger id="curriculum" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRICULA.map((c) => (
                    <SelectItem key={c} value={c}>
                      {curriculumLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={state?.fieldErrors?.curriculum} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">{levelLabel}</Label>
              <Select name="gradeLevel" key={curriculum}>
                <SelectTrigger id="gradeLevel" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={state?.fieldErrors?.gradeLevel} />
            </div>
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
            By creating an account you agree to Tusome&apos;s{" "}
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
