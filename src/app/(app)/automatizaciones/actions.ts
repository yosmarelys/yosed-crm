"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function toggleRule(id: string, enabled: boolean) {
  await requireSession();
  await prisma.automationRule.update({ where: { id }, data: { enabled } });
  revalidatePath("/automatizaciones");
}

export type RunResult = { overdue: number; followUps: number; welcomes: number };

export async function runAutomationsNow(): Promise<RunResult> {
  await requireSession();
  const now = new Date();
  const rules = await prisma.automationRule.findMany();
  const ruleEnabled = (name: string) => rules.find((r) => r.name === name)?.enabled ?? true;

  let overdue = 0;
  let followUps = 0;
  let welcomes = 0;

  if (ruleEnabled("Marcar facturas vencidas")) {
    const overdueInvoices = await prisma.invoice.findMany({
      where: { status: "PENDING", paymentDate: { lt: now } },
    });
    for (const inv of overdueInvoices) {
      await prisma.invoice.update({ where: { id: inv.id }, data: { status: "OVERDUE" } });
      if (inv.sellerId) {
        await prisma.notification.create({
          data: {
            userId: inv.sellerId,
            title: "Factura vencida",
            body: `La factura de ${inv.clientName} (${inv.serviceName}) venció y sigue sin pago.`,
            link: "/facturacion",
          },
        });
      }
    }
    overdue = overdueInvoices.length;
    await prisma.automationRule.updateMany({ where: { name: "Marcar facturas vencidas" }, data: { lastRunAt: now } });
  }

  if (ruleEnabled("Seguimiento de citas agendadas")) {
    const staleLeads = await prisma.lead.findMany({
      where: { stage: "AGENDADO", appointmentDate: { lt: now }, attendance: null },
      take: 200,
    });
    for (const lead of staleLeads) {
      const targetUserId = lead.agentId;
      if (!targetUserId) continue;
      const existing = await prisma.notification.findFirst({
        where: { userId: targetUserId, title: "Seguimiento de cita", body: { contains: lead.id } },
      });
      if (existing) continue;
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: "Seguimiento de cita",
          body: `Confirma si el lead ${lead.firstName ?? lead.phone ?? lead.id} asistió a su cita.`,
          link: "/leads",
        },
      });
      followUps++;
    }
    await prisma.automationRule.updateMany({ where: { name: "Seguimiento de citas agendadas" }, data: { lastRunAt: now } });
  }

  if (ruleEnabled("Bienvenida a cliente nuevo")) {
    const candidates = await prisma.client.findMany({
      where: { invoices: { some: {} } },
      include: { _count: { select: { invoices: true } } },
    });
    const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "VENTAS"] } }, select: { id: true } });
    for (const c of candidates) {
      if (c._count.invoices !== 1) continue;
      const existing = await prisma.notification.findFirst({
        where: { title: "Bienvenida a cliente nuevo", link: `/clientes/${c.id}` },
      });
      if (existing) continue;
      for (const a of admins.slice(0, 1)) {
        await prisma.notification.create({
          data: {
            userId: a.id,
            title: "Bienvenida a cliente nuevo",
            body: `${c.fullName} recibió su primera factura. Envíale un mensaje de bienvenida.`,
            link: `/clientes/${c.id}`,
          },
        });
      }
      welcomes++;
    }
    await prisma.automationRule.updateMany({ where: { name: "Bienvenida a cliente nuevo" }, data: { lastRunAt: now } });
  }

  revalidatePath("/automatizaciones");
  revalidatePath("/facturacion");
  revalidatePath("/dashboard");
  return { overdue, followUps, welcomes };
}
