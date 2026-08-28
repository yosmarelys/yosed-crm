"use client";

import { useEffect, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { X, Sparkles, MessageSquareText, UserRound, Wand2, Loader2 } from "lucide-react";
import {
  updateDesignTaskAction,
  generateChatSummaryAction,
  generateAiAnalysisAction,
  type UpdateDesignTaskState,
} from "./actions";
import { DESIGN_PRIORITIES, DESIGN_PRIORITY_LABEL, type DesignPriority } from "@/lib/constants";
import type { DesignCardData } from "./DesignBoard";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="dg-btn-primary w-full h-11">
      {pending ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}

export function DesignTaskDrawer({
  task,
  campaigns,
  designers,
  onClose,
  onUpdated,
}: {
  task: DesignCardData;
  campaigns: { id: string; name: string }[];
  designers: { id: string; name: string; color: string }[];
  onClose: () => void;
  onUpdated: (patch: Partial<DesignCardData> & { id: string }) => void;
}) {
  const [state, formAction] = useFormState<UpdateDesignTaskState, FormData>(
    updateDesignTaskAction,
    {}
  );

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<DesignPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");
  const [campaignId, setCampaignId] = useState(task.campaign?.id ?? "");
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id ?? "");

  const [chatNotes, setChatNotes] = useState(task.clientChatNotes ?? "");
  const [chatSummary, setChatSummary] = useState(task.clientChatSummary ?? "");
  const [sellerOpinion, setSellerOpinion] = useState(task.sellerOpinion ?? "");
  const [clientOpinion, setClientOpinion] = useState(task.clientOpinion ?? "");
  const [aiAnalysis, setAiAnalysis] = useState(task.aiAnalysis ?? "");

  const [summaryPending, startSummary] = useTransition();
  const [analysisPending, startAnalysis] = useTransition();
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (state.ok) {
      onUpdated({
        id: task.id,
        title,
        description: description || null,
        priority,
        dueDate: dueDate ? new Date(dueDate + "T12:00:00").toISOString() : null,
        campaign: campaigns.find((c) => c.id === campaignId) ?? null,
        assignee: designers.find((d) => d.id === assigneeId) ?? null,
        clientChatNotes: chatNotes || null,
        sellerOpinion: sellerOpinion || null,
        clientOpinion: clientOpinion || null,
      });
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  function handleGenerateSummary() {
    setSummaryError(null);
    startSummary(async () => {
      try {
        const summary = await generateChatSummaryAction(task.id, chatNotes);
        setChatSummary(summary);
        onUpdated({ id: task.id, clientChatNotes: chatNotes, clientChatSummary: summary });
      } catch (e: any) {
        setSummaryError(e?.message || "No se pudo generar el resumen.");
      }
    });
  }

  function handleGenerateAnalysis() {
    setAnalysisError(null);
    startAnalysis(async () => {
      try {
        const analysis = await generateAiAnalysisAction(task.id, {
          chatSummary,
          sellerOpinion,
          clientOpinion,
        });
        setAiAnalysis(analysis);
        onUpdated({ id: task.id, sellerOpinion, clientOpinion, aiAnalysis: analysis });
      } catch (e: any) {
        setAnalysisError(e?.message || "No se pudo generar el análisis.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative h-full w-full max-w-xl overflow-hidden bg-[#0b0b0e]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-brand-500/25 blur-[110px]" />
          <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-accent-violet/20 blur-[110px]" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent-pink/10 blur-[100px]" />
        </div>

        <div className="relative flex h-full flex-col overflow-y-auto scrollbar-thin p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
                <Sparkles className="h-5 w-5 text-white" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                  Solicitud de diseño
                </p>
                <p className="text-sm text-white/60">Editar tarjeta</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form action={formAction} className="flex-1 space-y-5">
            <input type="hidden" name="id" value={task.id} />

            <div className="dg-card space-y-3">
              <div className="space-y-1.5">
                <label className="dg-label">Título</label>
                <input
                  name="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="dg-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="dg-label">Descripción</label>
                <textarea
                  name="description"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="dg-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="dg-label">Prioridad</label>
                  <select
                    name="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as DesignPriority)}
                    className="dg-input"
                  >
                    {DESIGN_PRIORITIES.map((p) => (
                      <option key={p} value={p} className="bg-[#161619]">
                        {DESIGN_PRIORITY_LABEL[p]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="dg-label">Fecha límite</label>
                  <input
                    name="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="dg-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="dg-label">Campaña</label>
                  <select
                    name="campaignId"
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="dg-input"
                  >
                    <option value="" className="bg-[#161619]">Ninguna</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#161619]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="dg-label">Asignar a</label>
                  <select
                    name="assigneeId"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="dg-input"
                  >
                    <option value="" className="bg-[#161619]">Sin asignar</option>
                    {designers.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#161619]">
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 1. Respuestas de clientes de campañas anteriores */}
            <div className="dg-card space-y-2.5">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-brand-300" />
                <h3 className="text-sm font-semibold text-white">
                  Respuestas de clientes de campañas anteriores
                </h3>
                <span className="dg-badge">IA · solo lectura</span>
              </div>
              <p className="text-xs text-white/40">
                Pega o escribe abajo lo que el cliente ha dicho (WhatsApp, llamadas, etc.) y genera un resumen.
              </p>
              <textarea
                name="clientChatNotes"
                rows={3}
                value={chatNotes}
                onChange={(e) => setChatNotes(e.target.value)}
                placeholder="Ej: el cliente pidió algo minimalista, colores pastel, ya vio ejemplos de Instagram…"
                className="dg-input"
              />
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={summaryPending || !chatNotes.trim()}
                className="dg-btn-secondary"
              >
                {summaryPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                Generar resumen
              </button>
              {summaryError && <p className="text-xs text-red-300">{summaryError}</p>}
              {chatSummary && (
                <div className="dg-readonly">
                  <p className="whitespace-pre-wrap text-sm text-white/85">{chatSummary}</p>
                </div>
              )}
            </div>

            {/* 2. Opinión del vendedor */}
            <div className="dg-card space-y-2.5">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-accent-teal" />
                <h3 className="text-sm font-semibold text-white">Opinión del vendedor</h3>
              </div>
              <textarea
                name="sellerOpinion"
                rows={3}
                value={sellerOpinion}
                onChange={(e) => setSellerOpinion(e.target.value)}
                placeholder="Tu recomendación o impresión sobre el diseño para este cliente…"
                className="dg-input"
              />
            </div>

            {/* 3. Opinión del cliente */}
            <div className="dg-card space-y-2.5">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-accent-pink" />
                <h3 className="text-sm font-semibold text-white">Opinión del cliente</h3>
              </div>
              <textarea
                name="clientOpinion"
                rows={3}
                value={clientOpinion}
                onChange={(e) => setClientOpinion(e.target.value)}
                placeholder="Lo que el cliente ha dicho que quiere para su diseño/arte…"
                className="dg-input"
              />
            </div>

            {/* 4. Opinión recopilada por la IA */}
            <div className="dg-card space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-300" />
                <h3 className="text-sm font-semibold text-white">Opinión recopilada por la IA</h3>
                <span className="dg-badge">IA · solo lectura</span>
              </div>
              <p className="text-xs text-white/40">
                Combina el resumen de conversaciones, la opinión del vendedor y la del cliente en una recomendación final.
              </p>
              <button
                type="button"
                onClick={handleGenerateAnalysis}
                disabled={analysisPending}
                className="dg-btn-secondary"
              >
                {analysisPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                Generar análisis
              </button>
              {analysisError && <p className="text-xs text-red-300">{analysisError}</p>}
              {aiAnalysis && (
                <div className="dg-readonly">
                  <p className="whitespace-pre-wrap text-sm text-white/85">{aiAnalysis}</p>
                </div>
              )}
            </div>

            {state.error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 border border-red-500/20">
                {state.error}
              </p>
            )}

            <SaveButton />
          </form>
        </div>
      </div>
    </div>
  );
}
