"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "./actions";
import { Sparkles } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full h-11 text-[15px]">
      {pending ? "Ingresando…" : "Entrar"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, {});

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0b0b0e] flex items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-brand-500/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent-pink/20 blur-[120px]" />
        <div className="absolute top-1/3 right-1/3 h-64 w-64 rounded-full bg-accent-violet/20 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
            <Sparkles className="h-7 w-7 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Yosed CRM</h1>
            <p className="mt-1 text-sm text-white/50">Ventas, clientes y campañas en un solo lugar</p>
          </div>
        </div>

        <form action={formAction} className="glass rounded-2xl2 border border-white/10 !bg-white/[0.06] p-6 shadow-popover backdrop-blur-2xl space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70">Correo</label>
            <input
              name="email"
              type="email"
              required
              defaultValue="admin@yosed.com"
              placeholder="tu@correo.com"
              className="input !bg-white/10 !border-white/10 !text-white placeholder:!text-white/40 focus:!ring-brand-400/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              defaultValue="yosed2024"
              placeholder="••••••••"
              className="input !bg-white/10 !border-white/10 !text-white placeholder:!text-white/40 focus:!ring-brand-400/30"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 border border-red-500/20">
              {state.error}
            </p>
          )}

          <SubmitButton />

          <p className="text-center text-xs text-white/30 pt-2">
            Usuario demo precargado · cambia la contraseña después del primer ingreso
          </p>
        </form>
      </div>
    </div>
  );
}
