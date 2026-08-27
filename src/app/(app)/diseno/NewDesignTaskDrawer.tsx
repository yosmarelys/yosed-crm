"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus, X } from "lucide-react";
import { createDesignTaskAction } from "./actions";
import { DESIGN_PRIORITIES, DESIGN_PRIORITY_LABEL } from "@/lib/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full h-11">
      {pending ? "Creando…" : "Crear solicitud"}
    </button>
  );
}

export function NewDesignTaskDrawer({
  campaigns,
  designers,
}: {
  campaigns: { id: string; name: string }[];
  designers: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createDesignTaskAction, {});

  useEffect(() => {
    if (!state.error && open) {
      // keep open only if error; otherwise handled by page revalidation
    }
  }, [state]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="h-4 w-4" /> Nueva solicitud
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="h-full w-full max-w-md overflow-y-auto scrollbar-thin bg-white p-6 shadow-popover">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Nueva solicitud de diseño</h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-black/[0.05]">
                <X className="h-5 w-5 text-ink-dim" />
              </button>
            </div>

            <form
              action={async (fd) => {
                await formAction(fd);
                setOpen(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-dim">Título</label>
                <input name="title" required className="input" placeholder="Ej. Carrusel para promoción de verano" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-dim">Descripción</label>
                <textarea name="description" rows={3} className="input" placeholder="Detalles, referencias, medidas…" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-dim">Prioridad</label>
                  <select name="priority" className="input" defaultValue="MEDIA">
                    {DESIGN_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {DESIGN_PRIORITY_LABEL[p]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-dim">Fecha límite</label>
                  <input name="dueDate" type="date" className="input" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-ink-dim">Campaña relacionada</label>
                  <select name="campaignId" className="input">
                    <option value="">Ninguna</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-ink-dim">Asignar a</label>
                  <select name="assigneeId" className="input">
                    <option value="">Sin asignar</option>
                    {designers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
              <SubmitButton />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
