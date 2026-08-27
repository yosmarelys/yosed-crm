"use client";

import { useState, useTransition } from "react";
import { Zap } from "lucide-react";
import { runAutomationsNow, type RunResult } from "./actions";

export function RunButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<RunResult | null>(null);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => startTransition(async () => setResult(await runAutomationsNow()))}
        disabled={pending}
        className="btn-primary"
      >
        <Zap className="h-4 w-4" /> {pending ? "Ejecutando…" : "Ejecutar ahora"}
      </button>
      {result && (
        <p className="text-sm text-ink-dim">
          {result.overdue} facturas marcadas vencidas · {result.followUps} recordatorios de seguimiento · {result.welcomes} bienvenidas creadas
        </p>
      )}
    </div>
  );
}
