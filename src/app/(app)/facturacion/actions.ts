"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function markInvoicePaid(id: string) {
  await requireSession();
  await prisma.invoice.update({
    where: { id },
    data: { status: "PAID", paymentDate: new Date() },
  });
  revalidatePath("/facturacion");
  revalidatePath("/dashboard");
}

export type CreateInvoiceState = { error?: string; ok?: boolean };

export async function createInvoiceAction(
  _prev: CreateInvoiceState,
  formData: FormData
): Promise<CreateInvoiceState> {
  const session = await requireSession();

  const clientName = String(formData.get("clientName") || "").trim();
  const clientPhone = String(formData.get("clientPhone") || "").trim();
  const serviceName = String(formData.get("serviceName") || "").trim();
  const price = parseFloat(String(formData.get("price") || "0"));
  const commission = parseFloat(String(formData.get("commission") || "0"));
  const sellerId = String(formData.get("sellerId") || "") || null;
  const dateStr = String(formData.get("date") || "");

  if (!clientName || !serviceName || !price) {
    return { error: "Completa cliente, servicio y precio." };
  }

  let client = clientPhone
    ? await prisma.client.findFirst({ where: { phone: clientPhone } })
    : await prisma.client.findFirst({ where: { fullName: clientName } });

  const date = dateStr ? new Date(dateStr + "T12:00:00") : new Date();

  if (!client) {
    client = await prisma.client.create({
      data: {
        fullName: clientName,
        phone: clientPhone || null,
        firstVisit: date,
        lastVisit: date,
        totalInvoiced: 0,
        totalCommission: 0,
      },
    });
  }

  const seller = sellerId ? await prisma.user.findUnique({ where: { id: sellerId } }) : null;

  await prisma.invoice.create({
    data: {
      date,
      clientId: client.id,
      clientName: client.fullName,
      clientPhone: client.phone,
      serviceName,
      price,
      commission: commission || Math.round(price * 0.15 * 100) / 100,
      sellerId: seller?.id ?? null,
      sellerName: seller?.name ?? null,
      status: "PENDING",
      paymentDate: new Date(date.getTime() + 31 * 86400000),
    },
  });

  await prisma.client.update({
    where: { id: client.id },
    data: {
      totalInvoiced: { increment: price },
      totalCommission: { increment: commission || Math.round(price * 0.15 * 100) / 100 },
      lastVisit: date,
    },
  });

  revalidatePath("/facturacion");
  revalidatePath("/dashboard");
  revalidatePath("/clientes");
  return { ok: true };
}
