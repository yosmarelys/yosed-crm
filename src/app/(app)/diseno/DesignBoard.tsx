"use client";

import { useState, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Calendar } from "lucide-react";
import { DESIGN_STATUSES, DESIGN_STATUS_LABEL, type DesignStatus, type DesignPriority } from "@/lib/constants";
import { updateDesignStatus } from "./actions";

export type DesignCardData = {
  id: string;
  title: string;
  description: string | null;
  priority: DesignPriority;
  status: string;
  dueDate: string | null;
  campaign: { id: string; name: string } | null;
  assignee: { id: string; name: string; color: string } | null;
};

const PRIORITY_TONE: Record<DesignPriority, string> = {
  BAJA: "bg-slate-100 text-slate-600",
  MEDIA: "bg-blue-50 text-blue-700",
  ALTA: "bg-amber-50 text-amber-700",
  URGENTE: "bg-red-50 text-red-700",
};

export function DesignBoard({ columns }: { columns: Record<DesignStatus, DesignCardData[]> }) {
  const [data, setData] = useState(columns);
  const [, startTransition] = useTransition();

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
                          className={`rounded-xl bg-white p-3 shadow-card transition hover:shadow-soft ${
                            dragSnapshot.isDragging ? "rotate-1 shadow-popover" : ""
                          }`}
                        >
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className={`badge ${PRIORITY_TONE[task.priority]}`}>{task.priority}</span>
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
                          <p className="text-sm font-medium text-ink">{task.title}</p>
                          {task.campaign && <p className="mt-1 text-xs text-ink-dim">🎯 {task.campaign.name}</p>}
                          {task.dueDate && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-dim">
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
  );
}
