"use client";

import { useState, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Phone, Calendar, X, UserCheck, ArrowRightCircle } from "lucide-react";
import { LEAD_STAGES, LEAD_STAGE_LABEL, type LeadStage } from "@/lib/constants";
import { updateLeadStage, assignLeadAgent, convertLeadToClient } from "./actions";

export type LeadCardData = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  source: string | null;
  channel: string | null;
  status: string | null;
  stage: string;
  date: string;
  appointmentDate: string | null;
  appointmentTime: string | null;
  attendance: string | null;
  agent: { id: string; name: string; color: string } | null;
};

const STAGE_COLOR: Record<LeadStage, string> = {
  NUEVO: "border-t-slate-400",
  CONTACTADO: "border-t-blue-400",
  INTERESADO: "border-t-violet-400",
  AGENDADO: "border-t-amber-400",
  GANADO: "border-t-emerald-400",
  PERDIDO: "border-t-red-400",
};

function leadName(l: LeadCardData) {
  return [l.firstName, l.lastName].filter(Boolean).join(" ") || "Sin nombre";
}

export function KanbanBoard({
  columns,
  counts,
  agents,
}: {
  columns: Record<LeadStage, LeadCardData[]>;
  counts: Record<LeadStage, number>;
  agents: { id: string; name: string; color: string }[];
}) {
  const [data, setData] = useState(columns);
  const [selected, setSelected] = useState<LeadCardData | null>(null);
  const [, startTransition] = useTransition();

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const from = source.droppableId as LeadStage;
    const to = destination.droppableId as LeadStage;

    setData((prev) => {
      const next = { ...prev };
      const fromList = [...next[from]];
      const [moved] = fromList.splice(source.index, 1);
      next[from] = fromList;
      const toList = from === to ? fromList : [...next[to]];
      moved.stage = to;
      toList.splice(destination.index, 0, moved);
      next[to] = toList;
      return next;
    });

    startTransition(() => updateLeadStage(draggableId, to));
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {LEAD_STAGES.map((stage) => (
            <Droppable droppableId={stage} key={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`w-72 shrink-0 rounded-2xl bg-black/[0.02] p-2.5 transition ${
                    snapshot.isDraggingOver ? "bg-brand-50" : ""
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between px-1.5">
                    <h3 className="text-sm font-semibold text-ink">{LEAD_STAGE_LABEL[stage]}</h3>
                    <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs font-medium text-ink-dim">
                      {counts[stage] ?? 0}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[calc(100vh-14rem)] overflow-y-auto scrollbar-thin px-0.5 pb-1">
                    {data[stage].map((lead, index) => (
                      <Draggable draggableId={lead.id} index={index} key={lead.id}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            onClick={() => setSelected(lead)}
                            className={`cursor-pointer rounded-xl border-t-[3px] bg-white p-3 shadow-card transition hover:shadow-soft ${
                              STAGE_COLOR[stage]
                            } ${dragSnapshot.isDragging ? "rotate-1 shadow-popover" : ""}`}
                          >
                            <p className="text-sm font-medium text-ink">{leadName(lead)}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-dim">
                              <Phone className="h-3 w-3" /> {lead.phone ?? "—"}
                            </p>
                            <p className="mt-1.5 text-xs text-ink-dim">{lead.source ?? "Otro"}</p>
                            {lead.appointmentDate && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-amber-700">
                                <Calendar className="h-3 w-3" />
                                {new Date(lead.appointmentDate).toLocaleDateString("es", { day: "2-digit", month: "short" })}
                                {lead.appointmentTime ? ` · ${lead.appointmentTime}` : ""}
                              </p>
                            )}
                            {lead.agent && (
                              <span
                                className="mt-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                                style={{ backgroundColor: lead.agent.color }}
                                title={lead.agent.name}
                              >
                                {lead.agent.name.slice(0, 1)}
                              </span>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {data[stage].length === 0 && (
                      <p className="py-6 text-center text-xs text-ink-dim/70">Sin leads</p>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {selected && (
        <LeadDrawer
          lead={selected}
          agents={agents}
          onClose={() => setSelected(null)}
          onAgentChange={(agentId) => {
            const agent = agents.find((a) => a.id === agentId) ?? null;
            setSelected((s) => (s ? { ...s, agent } : s));
            setData((prev) => {
              const next = { ...prev };
              const stage = selected.stage as LeadStage;
              next[stage] = next[stage].map((l) => (l.id === selected.id ? { ...l, agent } : l));
              return next;
            });
            startTransition(() => assignLeadAgent(selected.id, agentId || null));
          }}
          onConvert={() => {
            startTransition(() => convertLeadToClient(selected.id));
            setSelected(null);
          }}
        />
      )}
    </>
  );
}

function LeadDrawer({
  lead,
  agents,
  onClose,
  onAgentChange,
  onConvert,
}: {
  lead: LeadCardData;
  agents: { id: string; name: string; color: string }[];
  onClose: () => void;
  onAgentChange: (agentId: string) => void;
  onConvert: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="h-full w-full max-w-sm overflow-y-auto scrollbar-thin bg-white p-6 shadow-popover">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{leadName(lead)}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-black/[0.05]">
            <X className="h-5 w-5 text-ink-dim" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs text-ink-dim">Teléfono</p>
            <p className="font-medium text-ink">{lead.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-ink-dim">Fuente / Canal</p>
            <p className="font-medium text-ink">{lead.source ?? "Otro"} · {lead.channel ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-ink-dim">Gestión original</p>
            <p className="font-medium text-ink">{lead.status ?? "—"}</p>
          </div>
          {lead.appointmentDate && (
            <div>
              <p className="text-xs text-ink-dim">Cita agendada</p>
              <p className="font-medium text-ink">
                {new Date(lead.appointmentDate).toLocaleDateString("es")} {lead.appointmentTime}
              </p>
              <p className="text-xs text-ink-dim">Asistencia: {lead.attendance ?? "Pendiente"}</p>
            </div>
          )}
          <div>
            <p className="mb-1 text-xs text-ink-dim">Agente asignado</p>
            <select
              value={lead.agent?.id ?? ""}
              onChange={(e) => onAgentChange(e.target.value)}
              className="input"
            >
              <option value="">Sin asignar</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {lead.stage !== "GANADO" && (
            <button onClick={onConvert} className="btn-primary w-full">
              <UserCheck className="h-4 w-4" /> Convertir en cliente
            </button>
          )}
          {lead.phone && (
            <a
              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary w-full"
            >
              <ArrowRightCircle className="h-4 w-4" /> Contactar por WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
