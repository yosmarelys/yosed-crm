"use client";

import { useState, useTransition } from "react";
import { CAMPAIGN_STATUSES, CAMPAIGN_STATUS_LABEL, type CampaignStatus } from "@/lib/constants";
import { updateCampaignStatus, updateCampaignBudget } from "./actions";

const STATUS_TONE: Record<CampaignStatus, string> = {
  PLANEADA: "bg-slate-100 text-slate-600",
  ACTIVA: "bg-emerald-50 text-emerald-700",
  PAUSADA: "bg-amber-50 text-amber-700",
  FINALIZADA: "bg-black/[0.05] text-ink-dim",
};

export function CampaignCard({
  campaign,
}: {
  campaign: {
    id: string;
    name: string;
    platform: string;
    status: string;
    budget: number;
    spent: number;
    leadsCount: number;
  };
}) {
  const [status, setStatus] = useState(campaign.status as CampaignStatus);
  const [budget, setBudget] = useState(campaign.budget);
  const [spent, setSpent] = useState(campaign.spent);
  const [, startTransition] = useTransition();

  const costPerLead = campaign.leadsCount > 0 ? spent / campaign.leadsCount : 0;
  const pctSpent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-[15px] font-semibold text-ink">{campaign.name}</p>
          <p className="text-xs text-ink-dim">{campaign.platform}</p>
        </div>
        <select
          value={status}
          onChange={(e) => {
            const s = e.target.value as CampaignStatus;
            setStatus(s);
            startTransition(() => updateCampaignStatus(campaign.id, s));
          }}
          className={`badge border-0 ${STATUS_TONE[status]}`}
        >
          {CAMPAIGN_STATUSES.map((s) => (
            <option key={s} value={s}>
              {CAMPAIGN_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs text-ink-dim">
          <span>Presupuesto invertido</span>
          <span>{pctSpent.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className={`h-full rounded-full ${pctSpent > 90 ? "bg-red-400" : "bg-brand-500"}`}
            style={{ width: `${pctSpent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-ink-dim">Presupuesto</p>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
            onBlur={() => startTransition(() => updateCampaignBudget(campaign.id, "budget", budget))}
            className="w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 font-medium text-ink hover:border-black/[0.08] hover:bg-black/[0.02] focus:border-brand-400 focus:bg-white focus:outline-none"
          />
        </div>
        <div>
          <p className="text-xs text-ink-dim">Gastado</p>
          <input
            type="number"
            value={spent}
            onChange={(e) => setSpent(parseFloat(e.target.value) || 0)}
            onBlur={() => startTransition(() => updateCampaignBudget(campaign.id, "spent", spent))}
            className="w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 font-medium text-ink hover:border-black/[0.08] hover:bg-black/[0.02] focus:border-brand-400 focus:bg-white focus:outline-none"
          />
        </div>
        <div>
          <p className="text-xs text-ink-dim">Leads generados</p>
          <p className="font-semibold text-ink">{campaign.leadsCount}</p>
        </div>
        <div>
          <p className="text-xs text-ink-dim">Costo por lead</p>
          <p className="font-semibold text-ink">${costPerLead.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
