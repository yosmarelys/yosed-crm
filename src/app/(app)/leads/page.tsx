import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { KanbanBoard, type LeadCardData } from "./KanbanBoard";
import { FilterSelect } from "./FilterSelect";
import { LEAD_STAGES, type LeadStage } from "@/lib/constants";

const COLUMN_LIMIT = 60;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { q?: string; source?: string; agent?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const source = searchParams.source ?? "";
  const agent = searchParams.agent ?? "";

  const where: any = {};
  if (q)
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
    ];
  if (source) where.source = source;
  if (agent === "unassigned") where.agentId = null;
  else if (agent) where.agentId = agent;

  const [leadsByStage, stageCounts, sourceRows, agents] = await Promise.all([
    Promise.all(
      LEAD_STAGES.map((stage) =>
        prisma.lead.findMany({
          where: { ...where, stage },
          orderBy: { date: "desc" },
          take: COLUMN_LIMIT,
          include: { agent: { select: { id: true, name: true, color: true } } },
        })
      )
    ),
    prisma.lead.groupBy({ by: ["stage"], where, _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["source"], _count: { _all: true }, orderBy: { _count: { source: "desc" } }, take: 15 }),
    prisma.user.findMany({ where: { role: { in: ["ADMIN", "VENTAS"] } }, select: { id: true, name: true, color: true } }),
  ]);

  const columns = {} as Record<LeadStage, LeadCardData[]>;
  LEAD_STAGES.forEach((stage, i) => {
    columns[stage] = leadsByStage[i].map((l) => ({
      id: l.id,
      firstName: l.firstName,
      lastName: l.lastName,
      phone: l.phone,
      source: l.source,
      channel: l.channel,
      status: l.status,
      stage: l.stage,
      date: l.date.toISOString(),
      appointmentDate: l.appointmentDate ? l.appointmentDate.toISOString() : null,
      appointmentTime: l.appointmentTime,
      attendance: l.attendance,
      agent: l.agent,
    }));
  });

  const counts = {} as Record<LeadStage, number>;
  const countMap = new Map(stageCounts.map((s) => [s.stage, s._count._all]));
  LEAD_STAGES.forEach((s) => (counts[s] = countMap.get(s) ?? 0));

  const totalFiltered = stageCounts.reduce((a, s) => a + s._count._all, 0);

  return (
    <div>
      <PageHeader
        title="Pipeline de ventas"
        subtitle={`${totalFiltered.toLocaleString()} leads · arrastra las tarjetas para cambiar de etapa`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Buscar lead por nombre o teléfono…" />

        <div className="flex flex-wrap gap-2">
          <FilterSelect
            name="source"
            value={source}
            placeholder="Todas las fuentes"
            options={sourceRows.map((r) => ({ value: r.source ?? "", label: `${r.source ?? "Otro"} (${r._count._all})` }))}
          />
          <FilterSelect
            name="agent"
            value={agent}
            placeholder="Todos los agentes"
            options={[
              { value: "unassigned", label: "Sin asignar" },
              ...agents.map((a) => ({ value: a.id, label: a.name })),
            ]}
          />
        </div>
      </div>

      <KanbanBoard columns={columns} counts={counts} agents={agents} />
    </div>
  );
}
