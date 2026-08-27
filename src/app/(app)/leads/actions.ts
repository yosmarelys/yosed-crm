"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { LEAD_STAGES, type LeadStage } from "@/lib/constants";

export async function updateLeadStage(id: string, stage: LeadStage) {
  await requireSession();
  if (!LEAD_STAGES.includes(stage)) return;
  await prisma.lead.update({ where: { id }, data: { stage } });
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function assignLeadAgent(id: string, agentId: string | null) {
  await requireSession();
  await prisma.lead.update({ where: { id }, data: { agentId } });
  revalidatePath("/leads");
}

export async function convertLeadToClient(id: string) {
  const session = await requireSession();
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return;

  let client = lead.phone ? await prisma.client.findFirst({ where: { phone: lead.phone } }) : null;
  if (!client) {
    client = await prisma.client.create({
      data: {
        fullName: [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Cliente sin nombre",
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        firstVisit: new Date(),
        lastVisit: new Date(),
      },
    });
  }

  await prisma.lead.update({
    where: { id },
    data: { stage: "GANADO", clientId: client.id, attendance: "Asistio" },
  });

  await prisma.notification.create({
    data: {
      userId: session.userId,
      title: "Lead convertido en cliente",
      body: `${client.fullName} ahora es cliente. Registra su primera factura.`,
      link: `/clientes/${client.id}`,
    },
  });

  revalidatePath("/leads");
  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}
