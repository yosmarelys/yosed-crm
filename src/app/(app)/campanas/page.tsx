import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { CampaignCard } from "./CampaignCard";
import { NewCampaignForm } from "./NewCampaignForm";

export default async function CampanasPage() {
  const [campaigns, leadCounts] = await Promise.all([
    prisma.campaign.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.lead.groupBy({ by: ["campaignId"], _count: { _all: true } }),
  ]);

  const countMap = new Map(leadCounts.map((l) => [l.campaignId, l._count._all]));

  const totalBudget = campaigns.reduce((a, c) => a + c.budget, 0);
  const totalSpent = campaigns.reduce((a, c) => a + c.spent, 0);
  const totalLeads = campaigns.reduce((a, c) => a + (countMap.get(c.id) ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Campañas"
        subtitle={`${campaigns.length} campañas · $${totalSpent.toLocaleString()} invertidos de $${totalBudget.toLocaleString()} · ${totalLeads.toLocaleString()} leads generados`}
        action={<NewCampaignForm />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => (
          <CampaignCard
            key={c.id}
            campaign={{
              id: c.id,
              name: c.name,
              platform: c.platform,
              status: c.status,
              budget: c.budget,
              spent: c.spent,
              leadsCount: countMap.get(c.id) ?? 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
