"use client";

import { useActionState } from "react";
import { Wallet } from "lucide-react";
import { purchaseDocumentAction } from "@/lib/actions/document-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/auth/field-error";

export function PurchaseDocumentForm({
  documentId,
  defaultPhone,
}: {
  documentId: string;
  defaultPhone: string;
}) {
  const [state, formAction, pending] = useActionState(purchaseDocumentAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="documentId" value={documentId} />
      <div className="space-y-2">
        <Label htmlFor="phone">M-Pesa phone number</Label>
        <Input id="phone" name="phone" defaultValue={defaultPhone} required />
        <FieldError messages={state?.fieldErrors?.phone} />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full gap-2" disabled={pending}>
        <Wallet className="h-4 w-4" />
        {pending ? "Starting M-Pesa payment..." : "Buy via M-Pesa"}
      </Button>
    </form>
  );
}
