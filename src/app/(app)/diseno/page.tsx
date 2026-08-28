import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { DesignBoard, type DesignCardData } from "./DesignBoard";
import { NewDesignTaskDrawer } from "./NewDesignTaskDrawer";
import { DESIGN_STATUSES, type DesignStatus } from "@/lib/constants";

export default async function DisenoPage() {
  const [tasks, campaigns, designers] = await Promise.all([
    prisma.designTask.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        campaign: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, color: true } },
      },
    }),
    prisma.campaign.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: { in: ["DISENO", "ADMIN"] } },
      select: { id: true, name: true, color: true },
    }),
  ]);

  const columns = {} as Record<DesignStatus, DesignCardData[]>;
  DESIGN_STATUSES.forEach((s) => (columns[s] = []));
  for (const t of tasks) {
    const status = t.status as DesignStatus;
    columns[status]?.push({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority as DesignCardData["priority"],
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      campaign: t.campaign,
      assignee: t.assignee,
      clientChatNotes: t.clientChatNotes,
      clientChatSummary: t.clientChatSummary,
      sellerOpinion: t.sellerOpinion,
      clientOpinion: t.clientOpinion,
      aiAnalysis: t.aiAnalysis,
    });
  }

  return (
    <div>
      <PageHeader
        title="Diseño"
        subtitle="Solicitudes creativas para campañas y contenido"
        action={<NewDesignTaskDrawer campaigns={campaigns} designers={designers} />}
      />
      <DesignBoard columns={columns} campaigns={campaigns} designers={designers} />
    </div>
  );
}
