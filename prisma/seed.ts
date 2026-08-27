import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import clientesData from "./seed-data/clientes.json";
import transaccionesData from "./seed-data/transacciones.json";
import leadsData from "./seed-data/leads.json";
import serviciosData from "./seed-data/servicios.json";

const prisma = new PrismaClient();

function parseDate(s?: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s + "T12:00:00");
  return isNaN(d.getTime()) ? null : d;
}

const SERVICE_CATEGORY: Record<string, string> = {
  Morpheus8: "Radiofrecuencia",
  Morpheus: "Radiofrecuencia",
  "Laser Co2": "Láser",
  Co2: "Láser",
  Hifu: "Radiofrecuencia",
  Microblading: "Cejas",
  Retoque: "Cejas",
  "Retoque de cejas": "Cejas",
  Facial: "Facial",
  "Facial Basic": "Facial",
  NCTF: "Facial",
  Remocion: "Pestañas",
  "Hair removal": "Depilación",
  "Hair Removal": "Depilación",
  Pestañas: "Pestañas",
  PRP: "Facial",
  IPL: "Depilación",
  "Waxing y": "Depilación",
  "Tattoo remover": "Cejas",
  "ADN Salmon": "Facial",
  BodySculpt: "Corporal",
  "Lip Blush": "Labios",
  "Depilacion Laser": "Depilación",
  "Hidra Lips": "Labios",
};

async function main() {
  console.log("Limpiando base de datos…");
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.channelMember.deleteMany();
  await prisma.chatChannel.deleteMany();
  await prisma.designTask.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.client.deleteMany();
  await prisma.serviceCatalog.deleteMany();
  await prisma.automationRule.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creando usuarios…");
  const passwordHash = await bcrypt.hash("yosed2024", 10);
  const [admin, andres, yoselid, maria, carla] = await Promise.all([
    prisma.user.create({
      data: { name: "Yosed Guillén", email: "admin@yosed.com", passwordHash, role: "ADMIN", color: "#3366ff" },
    }),
    prisma.user.create({
      data: { name: "Andrés", email: "andres@yosed.com", passwordHash, role: "VENTAS", color: "#14b8a6" },
    }),
    prisma.user.create({
      data: { name: "Yoselid", email: "yoselid@yosed.com", passwordHash, role: "VENTAS", color: "#f5a623" },
    }),
    prisma.user.create({
      data: { name: "María Fernanda", email: "maria@yosed.com", passwordHash, role: "DISENO", color: "#8b5cf6" },
    }),
    prisma.user.create({
      data: { name: "Carla Campos", email: "carla@yosed.com", passwordHash, role: "CAMPANAS", color: "#ff5c8a" },
    }),
  ]);
  const sellerByName: Record<string, string> = {
    andres: andres.id,
    yoselid: yoselid.id,
    yosed: admin.id,
  };
  const ventasUsers = [andres.id, yoselid.id];

  console.log("Creando catálogo de servicios…");
  const topServices = (serviciosData as any[])
    .filter((s) => s.count >= 3)
    .slice(0, 26);
  const serviceCatalogByName = new Map<string, string>();
  for (const s of topServices) {
    const price = Math.round(s.avgPrice / 5) * 5;
    const created = await prisma.serviceCatalog.create({
      data: {
        name: s.name,
        category: SERVICE_CATEGORY[s.name] ?? "General",
        price,
      },
    });
    serviceCatalogByName.set(s.name.toLowerCase(), created.id);
  }

  console.log("Creando clientes…");
  const clientByPhone = new Map<string, string>();
  const clientByName = new Map<string, string>();
  for (const c of clientesData as any[]) {
    const created = await prisma.client.create({
      data: {
        fullName: c["Nombre completo"] ?? "Sin nombre",
        firstName: c["Nombre"] ?? null,
        lastName: c["Apellido"] ?? null,
        phone: c["Teléfono"] ?? null,
        notes: c["Servicios realizados"] ?? null,
        firstVisit: parseDate(c["Primera visita"]),
        lastVisit: parseDate(c["Última visita"]),
        totalInvoiced: c["Total facturado"] ?? 0,
        totalCommission: c["Total comisión"] ?? 0,
      },
    });
    if (c["Teléfono"]) clientByPhone.set(c["Teléfono"], created.id);
    clientByName.set((c["Nombre completo"] || "").toLowerCase(), created.id);
  }

  console.log("Creando facturación (histórico de transacciones)…");
  const trans = (transaccionesData as any[]).filter((t) => t["Fecha"]);
  trans.sort((a, b) => (a["Fecha"] < b["Fecha"] ? -1 : 1));
  const now = new Date();
  const totalTrans = trans.length;

  for (let i = 0; i < totalTrans; i++) {
    const t = trans[i];
    const date = parseDate(t["Fecha"]) ?? now;
    const clientId = (t["Teléfono"] && clientByPhone.get(t["Teléfono"])) || clientByName.get((t["Cliente"] || "").toLowerCase()) || null;
    const sellerKey = (t["Vendedor"] || "").toLowerCase();
    const sellerId = sellerByName[sellerKey] ?? null;
    const normalizedService = (t["Servicio"] || "General").replace(/-\d+$/, "").trim();
    const serviceId = serviceCatalogByName.get(normalizedService.toLowerCase()) ?? null;

    const isRecent = i >= totalTrans - 36;
    let status: string = "PAID";
    let paymentDate: Date | null = new Date(date.getTime() + 31 * 86400000);
    if (isRecent) {
      const roll = Math.random();
      if (roll < 0.45) {
        status = "PENDING";
        paymentDate = new Date(now.getTime() + Math.floor(Math.random() * 20) * 86400000);
      } else if (roll < 0.7) {
        status = "OVERDUE";
        paymentDate = new Date(now.getTime() - Math.floor(Math.random() * 15 + 1) * 86400000);
      }
    }

    await prisma.invoice.create({
      data: {
        date,
        clientId,
        clientName: t["Cliente"] || "Cliente",
        clientPhone: t["Teléfono"] ?? null,
        serviceId,
        serviceName: t["Servicio"] || "Servicio",
        price: t["Precio"] ?? 0,
        commission: t["Comisión"] ?? 0,
        sellerId,
        sellerName: t["Vendedor"] ?? null,
        paymentDate,
        status,
      },
    });
  }

  console.log("Creando campañas a partir de fuentes de leads…");
  const leadsRaw = (leadsData as any[]).filter((l) => l["Fecha"]);
  const sourceCounts = new Map<string, number>();
  for (const l of leadsRaw) {
    const src = String(l["Publicidad"] ?? "Otro").trim() || "Otro";
    sourceCounts.set(src, (sourceCounts.get(src) || 0) + 1);
  }
  const campaignBySource = new Map<string, string>();
  const platforms = ["Facebook Ads", "Instagram Ads", "TikTok Ads", "Google Ads"];
  let pi = 0;
  for (const [source, count] of sourceCounts) {
    if (count < 2) continue;
    const budget = Math.round(count * 12.5);
    const created = await prisma.campaign.create({
      data: {
        name: `${source}`,
        platform: platforms[pi++ % platforms.length],
        status: count > 50 ? "ACTIVA" : "PAUSADA",
        budget,
        spent: Math.round(budget * (0.55 + Math.random() * 0.4)),
        startDate: new Date("2023-06-01T12:00:00"),
        ownerId: carla.id,
      },
    });
    campaignBySource.set(source, created.id);
  }

  console.log(`Creando ${leadsRaw.length} leads…`);
  const STAGE_MAP: Record<string, string> = {
    "No Contesta": "CONTACTADO",
    "Llamar despues": "CONTACTADO",
    "Pendte agendar": "CONTACTADO",
    "Proximo mes": "CONTACTADO",
    Repetido: "CONTACTADO",
    Oportunidad: "INTERESADO",
    "Solicito informacion": "INTERESADO",
    Agendada: "AGENDADO",
    "No Interesada": "PERDIDO",
    "Vive lejos": "PERDIDO",
    "Numero equivocado": "PERDIDO",
  };

  const asString = (v: unknown) => (v === null || v === undefined ? "" : String(v));

  const leadRows = leadsRaw.map((l, idx) => {
    const gestion = asString(l["Gestion"]).trim();
    let stage = STAGE_MAP[gestion] ?? "NUEVO";
    if (l["Asistencia"] === "Asistio") stage = "GANADO";
    const source = asString(l["Publicidad"]).trim() || "Otro";
    const agentId = idx % 5 < 2 ? ventasUsers[idx % ventasUsers.length] : null;
    return {
      date: parseDate(l["Fecha"]) ?? now,
      source,
      gender: l["Genero"] != null ? asString(l["Genero"]) : null,
      channel: l["Entrada"] != null ? asString(l["Entrada"]) : null,
      firstName: asString(l["Nombre"]).trim() || null,
      lastName: asString(l["Apellido"]).trim() || null,
      phone: l["Numero"] != null ? asString(l["Numero"]) : null,
      status: gestion || null,
      stage,
      agentId,
      appointmentDate: parseDate(l["fecha de cita"]),
      appointmentTime: l["Hora de cita"] != null ? asString(l["Hora de cita"]) : null,
      attendance: l["Asistencia"] != null ? asString(l["Asistencia"]) : null,
      campaignId: campaignBySource.get(source) ?? null,
    };
  });
  const BATCH = 200;
  for (let i = 0; i < leadRows.length; i += BATCH) {
    await prisma.lead.createMany({ data: leadRows.slice(i, i + BATCH) });
  }

  console.log("Creando tareas de diseño de ejemplo…");
  const campaignIds = [...campaignBySource.values()];
  const designSeed: Array<{ title: string; status: string; priority: string; days: number }> = [
    { title: "Set de 6 posts para Morpheus8 (antes/después)", status: "EN_DISENO", priority: "ALTA", days: 2 },
    { title: "Reel promocional Laser CO2", status: "REVISION", priority: "URGENTE", days: 1 },
    { title: "Carrusel Instagram: Lip Blush", status: "SOLICITADO", priority: "MEDIA", days: 4 },
    { title: "Flyer promoción de temporada Hidra Lips", status: "APROBADO", priority: "MEDIA", days: 3 },
    { title: "Historias destacadas nuevo servicio BodySculpt", status: "ENTREGADO", priority: "BAJA", days: 6 },
    { title: "Banner landing page Microblading", status: "SOLICITADO", priority: "ALTA", days: 5 },
  ];
  for (let i = 0; i < designSeed.length; i++) {
    const d = designSeed[i];
    await prisma.designTask.create({
      data: {
        title: d.title,
        description: "Solicitud generada para campaña activa de captación de leads.",
        status: d.status,
        priority: d.priority,
        dueDate: new Date(now.getTime() + d.days * 86400000),
        campaignId: campaignIds[i % campaignIds.length] ?? null,
        assigneeId: maria.id,
        requesterId: carla.id,
      },
    });
  }

  console.log("Creando reglas de automatización…");
  await prisma.automationRule.createMany({
    data: [
      {
        name: "Marcar facturas vencidas",
        description: "Si una factura pasa su fecha de pago sin estar marcada como pagada, se marca como vencida y se notifica al vendedor.",
        trigger: "invoice.paymentDate < today AND status != PAID",
        action: "Marcar como OVERDUE + notificar al vendedor",
        enabled: true,
      },
      {
        name: "Seguimiento de citas agendadas",
        description: "Si una cita agendada ya pasó y no se registró asistencia, se crea un recordatorio para el agente de ventas.",
        trigger: "lead.stage = AGENDADO AND appointmentDate < today AND attendance is null",
        action: "Crear notificación de seguimiento para el agente asignado",
        enabled: true,
      },
      {
        name: "Bienvenida a cliente nuevo",
        description: "Cuando un cliente recibe su primera factura, se crea una tarea para enviarle un mensaje de bienvenida y pedir reseña.",
        trigger: "client.invoiceCount = 1",
        action: "Notificar al equipo de ventas para enviar mensaje de bienvenida",
        enabled: true,
      },
    ],
  });

  console.log("Creando canales de chat…");
  const general = await prisma.chatChannel.create({ data: { name: "General" } });
  const ventasChannel = await prisma.chatChannel.create({ data: { name: "Ventas" } });
  const marketingChannel = await prisma.chatChannel.create({ data: { name: "Diseño & Campañas" } });

  const allUsers = [admin, andres, yoselid, maria, carla];
  for (const u of allUsers) {
    await prisma.channelMember.create({ data: { channelId: general.id, userId: u.id } });
  }
  for (const u of [admin, andres, yoselid]) {
    await prisma.channelMember.create({ data: { channelId: ventasChannel.id, userId: u.id } });
  }
  for (const u of [admin, maria, carla]) {
    await prisma.channelMember.create({ data: { channelId: marketingChannel.id, userId: u.id } });
  }

  await prisma.chatMessage.createMany({
    data: [
      { channelId: general.id, senderId: admin.id, body: "¡Bienvenidos al nuevo CRM! 🎉 Aquí vamos a coordinar todo el equipo." },
      { channelId: general.id, senderId: carla.id, body: "Genial, ya estoy viendo las campañas activas 👀" },
      { channelId: ventasChannel.id, senderId: andres.id, body: "Buen día equipo, hoy tengo 5 citas agendadas." },
      { channelId: ventasChannel.id, senderId: yoselid.id, body: "Yo tengo 3, dos son de Morpheus8." },
      { channelId: marketingChannel.id, senderId: maria.id, body: "Les dejo el set de Morpheus8 para revisión en la sección de Diseño." },
    ],
  });

  console.log("Creando notificaciones de ejemplo…");
  await prisma.notification.createMany({
    data: [
      { userId: andres.id, title: "Nueva cita agendada", body: "Tienes una cita hoy a las 3:00pm", link: "/leads" },
      { userId: maria.id, title: "Nueva tarea de diseño", body: "Carla te asignó: Banner landing page Microblading", link: "/diseno" },
      { userId: carla.id, title: "Campaña con bajo rendimiento", body: "Revisa el costo por lead de Laser CO2", link: "/campanas" },
    ],
  });

  console.log("Creando historial de asistencia (última semana)…");
  for (const u of allUsers) {
    for (let d = 6; d >= 1; d--) {
      const day = new Date(now.getTime() - d * 86400000);
      const dateStr = day.toISOString().slice(0, 10);
      const clockIn = new Date(day);
      clockIn.setHours(8 + Math.floor(Math.random() * 1), Math.floor(Math.random() * 30), 0, 0);
      const clockOut = new Date(clockIn);
      clockOut.setHours(clockIn.getHours() + 8 + Math.floor(Math.random() * 1), clockIn.getMinutes() + Math.floor(Math.random() * 30), 0, 0);
      await prisma.timeEntry.create({
        data: { userId: u.id, date: dateStr, clockIn, clockOut },
      });
    }
  }

  console.log("Listo ✅");
  console.log(`  Usuarios: ${allUsers.length}`);
  console.log(`  Clientes: ${clientesData.length}`);
  console.log(`  Facturas: ${totalTrans}`);
  console.log(`  Leads: ${leadRows.length}`);
  console.log(`  Campañas: ${campaignBySource.size}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
