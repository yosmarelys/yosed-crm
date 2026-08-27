"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus, X } from "lucide-react";
import { createServiceAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary h-10 px-4 text-sm">
      {pending ? "Guardando…" : "Agregar servicio"}
    </button>
  );
}

export function NewServiceForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createServiceAction, {});
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!state.error && open) {
      // reset form after a successful submit by remounting
    }
  }, [state]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="h-4 w-4" /> Nuevo servicio
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
        <input name="name" required className="input h-9 w-40" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-ink-dim">Categoría</label>
        <input name="category" className="input h-9 w-32" placeholder="General" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-ink-dim">Precio</label>
        <input name="price" type="number" step="0.01" required className="input h-9 w-24" />
      </div>
      <SubmitButton />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-dim hover:bg-black/[0.05]"
      >
        <X className="h-4 w-4" />
      </button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
