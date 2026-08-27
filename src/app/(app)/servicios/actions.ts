"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function updateServicePrice(id: string, price: number) {
  await requireSession();
  if (!Number.isFinite(price) || price < 0) return;
  await prisma.serviceCatalog.update({ where: { id }, data: { price } });
  revalidatePath("/servicios");
}

export async function toggleServiceActive(id: string, active: boolean) {
  await requireSession();
  await prisma.serviceCatalog.update({ where: { id }, data: { active } });
  revalidatePath("/servicios");
}

export type CreateServiceState = { error?: string };

export async function createServiceAction(
  _prev: CreateServiceState,
  formData: FormData
): Promise<CreateServiceState> {
  await requireSession();
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "General").trim();
  const price = parseFloat(String(formData.get("price") || "0"));

  if (!name || !price) return { error: "Nombre y precio son obligatorios." };

  await prisma.serviceCatalog.create({ data: { name, category, price } });
  revalidatePath("/servicios");
  return {};
}
