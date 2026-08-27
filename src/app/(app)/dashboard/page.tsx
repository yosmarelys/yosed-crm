import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { LEAD_STAGE_LABEL, type LeadStage } from "@/lib/constants";
import { RevenueChart, FunnelChart } from "./DashboardCharts";
import { TrendingUp, Users, Receipt, Target, AlertTriangle } from "lucide-react";
import Link from "next/link";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function DashboardPage() {
  const [invoices, leadStageCounts, clientCount, overdueCount, upcomingAppointments] = await Promise.all([
    prisma.invoice.findMany({
      select: { date: true, price: true, commission: true, status: true, sellerName: true },
    }),
    prisma.lead.groupBy({ by: ["stage"], _count: { _all: true } }),
    prisma.client.count(),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    prisma.lead.count({ where: { stage: "AGENDADO" } }),
  ]);

  const totalInvoiced = invoices.reduce((a, i) => a + i.price, 0);
  const totalCommission = invoices.reduce((a, i) => a + i.commission, 0);
  const pendingAmount = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((a, i) => a + i.price, 0);

  const monthly = new Map<string, { revenue: number; commission: number }>();
  for (const inv of invoices) {
    const key = inv.date.toISOString().slice(0, 7);
    const cur = monthly.get(key) ?? { revenue: 0, commission: 0 };
    cur.revenue += inv.price;
    cur.commission += inv.commission;
    monthly.set(key, cur);
  }
  const monthlySeries = [...monthly.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-12)
    .map(([month, v]) => ({
      month: new Date(month + "-02").toLocaleDateString("es", { month: "short", year: "2-digit" }),
      revenue: Math.round(v.revenue),
      commission: Math.round(v.commission),
    }));

  const sellerTotals = new Map<string, { revenue: number; count: number }>();
  for (const inv of invoices) {
    const name = inv.sellerName || "Sin asignar";
    const cur = sellerTotals.get(name) ?? { revenue: 0, count: 0 };
    cur.revenue += inv.price;
    cur.count += 1;
    sellerTotals.set(name, cur);
  }
  const topSellers = [...sellerTotals.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, v]) => ({ name, ...v }));

  const stageOrder: LeadStage[] = ["NUEVO", "CONTACTADO", "INTERESADO", "AGENDADO", "GANADO", "PERDIDO"];
  const stageCountMap = new Map(leadStageCounts.map((s) => [s.stage, s._count._all]));
  const funnel = stageOrder.map((s) => ({ stage: LEAD_STAGE_LABEL[s], count: stageCountMap.get(s) ?? 0 }));
  const totalLeads = leadStageCounts.reduce((a, s) => a + s._count._all, 0);
  const won = stageCountMap.get("GANADO") ?? 0;
  const conversionRate = totalLeads ? Math.round((won / totalLeads) * 100) : 0;

  const kpis = [
    { label: "Facturación total", value: money(totalInvoiced), icon: TrendingUp, tone: "text-brand-600 bg-brand-50" },
    { label: "Comisiones generadas", value: money(totalCommission), icon: Receipt, tone: "text-accent-teal bg-teal-50" },
    { label: "Clientes activos", value: clientCount.toLocaleString(), icon: Users, tone: "text-accent-violet bg-violet-50" },
    { label: "Tasa de conversión de leads", value: `${conversionRate}%`, icon: Target, tone: "text-accent-pink bg-pink-50" },
  ];

  return (
    <div>
      <PageHeader
        title="Panel de ventas"
        subtitle="Resumen general del negocio, en tiempo real"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${k.tone}`}>
              <k.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <p className="text-2xl font-semibold tracking-tight text-ink">{k.value}</p>
            <p className="text-sm text-ink-dim">{k.label}</p>
          </div>
        ))}
      </div>

      {(overdueCount > 0 || upcomingAppointments > 0) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {overdueCount > 0 && (
            <Link
              href="/facturacion"
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              <AlertTriangle className="h-4 w-4" />
              {overdueCount} factura(s) vencida(s) requieren atención
            </Link>
          )}
          {upcomingAppointments > 0 && (
            <Link
              href="/leads"
              className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
            >
              <Target className="h-4 w-4" />
              {upcomingAppointments} cita(s) agendada(s) en el pipeline
            </Link>
          )}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-[15px] font-semibold text-ink">Ingresos y comisiones por mes</h2>
          <RevenueChart data={monthlySeries} />
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-[15px] font-semibold text-ink">Embudo de leads</h2>
          <FunnelChart data={funnel} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-[15px] font-semibold text-ink">Top vendedores por facturación</h2>
          <div className="space-y-3">
            {topSellers.map((s, idx) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.04] text-xs font-semibold text-ink-dim">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">{s.name}</span>
                    <span className="text-ink-dim">{money(s.revenue)}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.min(100, (s.revenue / (topSellers[0]?.revenue || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-[15px] font-semibold text-ink">Por cobrar</h2>
          <p className="text-3xl font-semibold text-ink">{money(pendingAmount)}</p>
          <p className="mt-1 text-sm text-ink-dim">en facturas pendientes o vencidas</p>
          <Link href="/facturacion" className="btn-secondary mt-4 w-full">
            Ver facturación
          </Link>
        </div>
      </div>
    </div>
  );
}
