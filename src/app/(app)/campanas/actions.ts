"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { CAMPAIGN_STATUSES, type CampaignStatus } from "@/lib/constants";

export async function updateCampaignStatus(id: string, status: CampaignStatus) {
  await requireSession();
  if (!CAMPAIGN_STATUSES.includes(status)) return;
  await prisma.campaign.update({ where: { id }, data: { status } });
  revalidatePath("/campanas");
}

export async function updateCampaignBudget(id: string, field: "budget" | "spent", value: number) {
  await requireSession();
  if (!Number.isFinite(value) || value < 0) return;
  await prisma.campaign.update({ where: { id }, data: { [field]: value } });
  revalidatePath("/campanas");
}

export type CreateCampaignState = { error?: string };

export async function createCampaignAction(
  _prev: CreateCampaignState,
  formData: FormData
): Promise<CreateCampaignState> {
  const session = await requireSession();
  const name = String(formData.get("name") || "").trim();
  const platform = String(formData.get("platform") || "").trim();
  const budget = parseFloat(String(formData.get("budget") || "0"));

  if (!name || !platform) return { error: "Nombre y plataforma son obligatorios." };

  await prisma.campaign.create({
    data: {
      name,
      platform,
      budget: budget || 0,
      startDate: new Date(),
      ownerId: session.userId,
    },
  });

  revalidatePath("/campanas");
  return {};
}
