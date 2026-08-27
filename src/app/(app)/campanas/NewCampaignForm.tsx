"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus, X } from "lucide-react";
import { createCampaignAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary h-10 px-4 text-sm">
      {pending ? "Creando…" : "Crear campaña"}
    </button>
  );
}

export function NewCampaignForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createCampaignAction, {});
  const [key, setKey] = useState(0);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="h-4 w-4" /> Nueva campaña
      </button>
    );
  }

  return (
    <form
      key={key}
      action={async (fd) => {
        await formAction(fd);
        setKey((k) => k + 1);
      }}
      className="flex flex-wrap items-end gap-2 rounded-2xl border border-black/[0.06] bg-white p-3 shadow-card"
    >
      <div className="space-y-1">
        <label className="text-xs font-medium text-ink-dim">Nombre</label>
        <input name="name" required className="input h-9 w-44" placeholder="Ej. Verano Morpheus8" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-ink-dim">Plataforma</label>
        <input name="platform" required className="input h-9 w-40" placeholder="Facebook Ads" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-ink-dim">Presupuesto</label>
        <input name="budget" type="number" step="0.01" className="input h-9 w-28" placeholder="0.00" />
      </div>
      <SubmitButton />
      <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-dim hover:bg-black/[0.05]">
        <X className="h-4 w-4" />
      </button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
