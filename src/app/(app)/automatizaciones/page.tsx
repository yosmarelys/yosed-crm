import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { RunButton } from "./RunButton";
import { RuleToggle } from "./RuleToggle";
import { Zap } from "lucide-react";

export default async function AutomatizacionesPage() {
  const rules = await prisma.automationRule.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader
        title="Automatización"
        subtitle="Reglas que mantienen el CRM al día sin intervención manual"
        action={<RunButton />}
      />

      <div className="space-y-3">
        {rules.map((r) => (
          <div key={r.id} className="card flex items-start justify-between gap-4 p-5">
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Zap className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-ink">{r.name}</p>
                <p className="mt-0.5 text-sm text-ink-dim">{r.description}</p>
                <p className="mt-2 rounded-lg bg-black/[0.03] px-2.5 py-1.5 font-mono text-xs text-ink-dim">
                  SI {r.trigger} → {r.action}
                </p>
                {r.lastRunAt && (
                  <p className="mt-1.5 text-xs text-ink-dim/70">
                    Última ejecución: {r.lastRunAt.toLocaleString("es")}
                  </p>
                )}
              </div>
            </div>
            <RuleToggle id={r.id} enabled={r.enabled} />
          </div>
        ))}
      </div>
    </div>
  );
}
