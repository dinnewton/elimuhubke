"use client";

import { useActionState, useState } from "react";
import { createSubjectAction } from "@/lib/actions/admin-actions";
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
import { FieldError } from "@/components/auth/field-error";
import { CURRICULA, GRADE_LEVELS_BY_CURRICULUM } from "@/lib/validation";
import { CURRICULUM_LABELS, curriculumLabel } from "@/lib/format";
import type { Curriculum } from "@/generated/prisma/client";

export function AddSubjectForm() {
  const [state, formAction, pending] = useActionState(createSubjectAction, null);
  const [curriculum, setCurriculum] = useState<Curriculum>("CBC");
  const levelSuggestions = GRADE_LEVELS_BY_CURRICULUM[curriculum];

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto] sm:items-end">
      <div className="space-y-2">
        <Label htmlFor="name">Subject name</Label>
        <Input id="name" name="name" placeholder="Mathematics" required />
        <FieldError messages={state?.fieldErrors?.name} />
      </div>
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="gradeLevel">Grade / Level</Label>
        <Input
          id="gradeLevel"
          name="gradeLevel"
          placeholder={levelSuggestions[0]}
          list="gradeLevel-suggestions"
          required
        />
        <datalist id="gradeLevel-suggestions">
          {levelSuggestions.map((level) => (
            <option key={level} value={level} />
          ))}
        </datalist>
        <FieldError messages={state?.fieldErrors?.gradeLevel} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hourlyRateKES">Rate (KES/hr)</Label>
        <Input
          id="hourlyRateKES"
          name="hourlyRateKES"
          type="number"
          min={50}
          step={10}
          placeholder="800"
          required
        />
        <FieldError messages={state?.fieldErrors?.hourlyRateKES} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add subject"}
      </Button>
      {state?.error && (
        <p className="sm:col-span-5 text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
