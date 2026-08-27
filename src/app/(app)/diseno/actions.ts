"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { DESIGN_STATUSES, type DesignStatus } from "@/lib/constants";

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
