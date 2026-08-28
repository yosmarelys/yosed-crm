"use client";

import { useState, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Calendar, Sparkles } from "lucide-react";
import { DESIGN_STATUSES, DESIGN_STATUS_LABEL, type DesignStatus, type DesignPriority } from "@/lib/constants";
import { updateDesignStatus } from "./actions";
import { DesignTaskDrawer } from "./DesignTaskDrawer";

export type DesignCardData = {
  id: string;
  title: string;
  description: string | null;
  priority: DesignPriority;
  status: string;
  dueDate: string | null;
  campaign: { id: string; name: string } | null;
  assignee: { id: string; name: string; color: string } | null;
  clientChatNotes: string | null;
  clientChatSummary: string | null;
  sellerOpinion: string | null;
  clientOpinion: string | null;
  aiAnalysis: string | null;
};

const PRIORITY_TONE: Record<DesignPriority, string> = {
  BAJA: "bg-white/10 text-white/70",
  MEDIA: "bg-brand-400/20 text-brand-200",
  ALTA: "bg-amber-400/20 text-amber-200",
  URGENTE: "bg-red-400/20 text-red-200",
};

export function DesignBoard({
  columns,
  campaigns,
  designers,
}: {
  columns: Record<DesignStatus, DesignCardData[]>;
  campaigns: { id: string; name: string }[];
  designers: { id: string; name: string; color: string }[];
}) {
  const [data, setData] = useState(columns);
  const [selected, setSelected] = useState<DesignCardData | null>(null);
  const [, startTransition] = useTransition();

  function handleTaskUpdated(patch: Partial<DesignCardData>) {
    setData((prev) => {
      const next = { ...prev };
      for (const status of DESIGN_STATUSES) {
        next[status] = next[status].map((t) => (t.id === patch.id ? { ...t, ...patch } : t));
      }
      return next;
    });
    setSelected((prev) => (prev && prev.id === patch.id ? { ...prev, ...patch } : prev));
  }

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const from = source.droppableId as DesignStatus;
    const to = destination.droppableId as DesignStatus;
    if (from === to && source.index === destination.index) return;

    setData((prev) => {
      const next = { ...prev };
      const fromList = [...next[from]];
      const [moved] = fromList.splice(source.index, 1);
      next[from] = fromList;
      const toList = from === to ? fromList : [...next[to]];
      toList.splice(destination.index, 0, moved);
      next[to] = toList;
      return next;
    });

    startTransition(() => updateDesignStatus(draggableId, to));
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {DESIGN_STATUSES.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`w-72 shrink-0 rounded-2xl bg-black/[0.02] p-2.5 transition ${snapshot.isDraggingOver ? "bg-brand-50" : ""}`}
                >
                  <div className="mb-2 flex items-center justify-between px-1.5">
                    <h3 className="text-sm font-semibold text-ink">{DESIGN_STATUS_LABEL[status]}</h3>
                    <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs font-medium text-ink-dim">
                      {data[status].length}
                    </span>
                  </div>
                  <div className="space-y-2 min-h-[4rem]">
                    {data[status].map((task, index) => (
                      <Draggable draggableId={task.id} index={index} key={task.id}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            onClick={() => setSelected(task)}
                            className={`cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#15151b] to-[#1b1530] p-3 shadow-lg shadow-black/20 transition hover:border-brand-400/40 ${
                              dragSnapshot.isDragging ? "rotate-1 shadow-popover" : ""
                            }`}
                          >
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className={`badge ${PRIORITY_TONE[task.priority]}`}>{task.priority}</span>
                              <div className="flex items-center gap-1.5">
                                {task.aiAnalysis && (
                                  <span title="Análisis de IA generado" className="text-brand-300">
                                    <Sparkles className="h-3.5 w-3.5" />
                                  </span>
                                )}
                                {task.assignee && (
                                  <span
                                    className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                                    style={{ backgroundColor: task.assignee.color }}
                                    title={task.assignee.name}
                                  >
                                    {task.assignee.name.slice(0, 1)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm font-medium text-white">{task.title}</p>
                            {task.campaign && <p className="mt-1 text-xs text-white/50">🎯 {task.campaign.name}</p>}
                            {task.dueDate && (
                              <p className="mt-1.5 flex items-center gap-1 text-xs text-white/50">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString("es", { day: "2-digit", month: "short" })}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {selected && (
        <DesignTaskDrawer
          task={selected}
          campaigns={campaigns}
          designers={designers}
          onClose={() => setSelected(null)}
          onUpdated={handleTaskUpdated}
        />
      )}
    </>
  );
}
