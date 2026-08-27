"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus, X } from "lucide-react";
import { createInvoiceAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full h-11">
      {pending ? "Guardando…" : "Crear factura"}
    </button>
  );
}

export function NewInvoiceDrawer({
  sellers,
  services,
}: {
  sellers: { id: string; name: string }[];
  services: { id: string; name: string; price: number }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createInvoiceAction, {});

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="h-4 w-4" /> Nueva factura
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="h-full w-full max-w-md overflow-y-auto scrollbar-thin bg-white p-6 shadow-popover">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Nueva factura</h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-black/[0.05]">
                <X className="h-5 w-5 text-ink-dim" />
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-ink-dim">Cliente</label>
                  <input name="clientName" required className="input" placeholder="Nombre completo" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-ink-dim">Teléfono</label>
                  <input name="clientPhone" className="input" placeholder="+1 (786) 000-0000" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-ink-dim">Servicio</label>
                  <input
                    name="serviceName"
                    required
                    list="service-options"
                    className="input"
                    placeholder="Ej. Microblading"
                  />
                  <datalist id="service-options">
                    {services.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-dim">Precio</label>
                  <input name="price" type="number" step="0.01" required className="input" placeholder="0.00" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-dim">Comisión</label>
                  <input name="commission" type="number" step="0.01" className="input" placeholder="auto 15%" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-dim">Fecha</label>
                  <input name="date" type="date" className="input" defaultValue={new Date().toISOString().slice(0, 10)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-dim">Vendedor</label>
                  <select name="sellerId" className="input">
                    <option value="">Sin asignar</option>
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {state.error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
              )}

              <SubmitButton />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
