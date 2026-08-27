"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { markInvoicePaid } from "./actions";

export function MarkPaidButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => markInvoicePaid(id))}
      disabled={pending}
      className="flex items-center gap-1 rounded-full border border-black/[0.08] px-2.5 py-1 text-xs font-medium text-ink-dim transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
    >
      <Check className="h-3 w-3" /> {pending ? "…" : "Marcar pagada"}
    </button>
  );
}
