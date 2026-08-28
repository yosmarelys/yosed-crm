"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { DESIGN_STATUSES, type DesignStatus } from "@/lib/constants";
import { summarizeClientChatNotes, generateDesignAiAnalysis } from "@/lib/ai";

export async function updateDesignStatus(id: string, status: DesignStatus) {
  await requireSession();
  if (!DESIGN_STATUSES.includes(status)) return;
  await prisma.designTask.update({ where: { id }, data: { status } });
  revalidatePath("/diseno");
}

export type CreateDesignTaskState = { error?: string };

export async function createDesignTaskAction(
  _prev: CreateDesignTaskState,
  formData: FormData
): Promise<CreateDesignTaskState> {
  const session = await requireSession();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priority = String(formData.get("priority") || "MEDIA");
  const campaignId = String(formData.get("campaignId") || "") || null;
  const assigneeId = String(formData.get("assigneeId") || "") || null;
  const dueDateStr = String(formData.get("dueDate") || "");

  if (!title) return { error: "El título es obligatorio." };

  await prisma.designTask.create({
    data: {
      title,
      description: description || null,
      priority,
      campaignId,
      assigneeId,
      requesterId: session.userId,
      dueDate: dueDateStr ? new Date(dueDateStr + "T12:00:00") : null,
    },
  });

  revalidatePath("/diseno");
  return {};
}

export type UpdateDesignTaskState = { error?: string; ok?: boolean };

export async function updateDesignTaskAction(
  _prev: UpdateDesignTaskState,
  formData: FormData
): Promise<UpdateDesignTaskState> {
  await requireSession();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  if (!id) return { error: "Falta el identificador de la tarjeta." };
  if (!title) return { error: "El título es obligatorio." };

  const description = String(formData.get("description") || "").trim();
  const priority = String(formData.get("priority") || "MEDIA");
  const campaignId = String(formData.get("campaignId") || "") || null;
  const assigneeId = String(formData.get("assigneeId") || "") || null;
  const dueDateStr = String(formData.get("dueDate") || "");
  const clientChatNotes = String(formData.get("clientChatNotes") || "").trim();
  const sellerOpinion = String(formData.get("sellerOpinion") || "").trim();
  const clientOpinion = String(formData.get("clientOpinion") || "").trim();

  await prisma.designTask.update({
    where: { id },
    data: {
      title,
      description: description || null,
      priority,
      campaignId,
      assigneeId,
      dueDate: dueDateStr ? new Date(dueDateStr + "T12:00:00") : null,
      clientChatNotes: clientChatNotes || null,
      sellerOpinion: sellerOpinion || null,
      clientOpinion: clientOpinion || null,
    },
  });

  revalidatePath("/diseno");
  return { ok: true };
}

export type GenerateResult = { result?: string; error?: string };

export async function generateChatSummaryAction(id: string, notes: string): Promise<GenerateResult> {
  await requireSession();

  if (!notes.trim()) {
    return { error: "Primero escribe o pega las notas de conversación con el cliente." };
  }

  const task = await prisma.designTask.findUnique({ where: { id } });
  if (!task) return { error: "No se encontró la tarjeta de diseño." };

  let summary: string;
  try {
    summary = await summarizeClientChatNotes(notes);
  } catch (e: any) {
    return { error: e?.message || "No se pudo generar el resumen." };
  }

  await prisma.designTask.update({
    where: { id },
    data: { clientChatNotes: notes, clientChatSummary: summary, clientChatUpdatedAt: new Date() },
  });

  revalidatePath("/diseno");
  return { result: summary };
}

export async function generateAiAnalysisAction(
  id: string,
  input: { chatSummary: string; sellerOpinion: string; clientOpinion: string }
): Promise<GenerateResult> {
  await requireSession();
  const task = await prisma.designTask.findUnique({ where: { id } });
  if (!task) return { error: "No se encontró la tarjeta de diseño." };

  let analysis: string;
  try {
    analysis = await generateDesignAiAnalysis({
      taskTitle: task.title,
      chatSummary: input.chatSummary || null,
      sellerOpinion: input.sellerOpinion || null,
      clientOpinion: input.clientOpinion || null,
    });
  } catch (e: any) {
    return { error: e?.message || "No se pudo generar el análisis." };
  }

  await prisma.designTask.update({
    where: { id },
    data: {
      sellerOpinion: input.sellerOpinion || null,
      clientOpinion: input.clientOpinion || null,
      aiAnalysis: analysis,
      aiAnalysisUpdatedAt: new Date(),
    },
  });

  revalidatePath("/diseno");
  return { result: analysis };
}
