import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Phone, Calendar, Receipt, TrendingUp, Target } from "lucide-react";
import { INVOICE_STATUS_LABEL, LEAD_STAGE_LABEL, type InvoiceStatus, type LeadStage } from "@/lib/constants";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function formatDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_TONE: Record<InvoiceStatus, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  OVERDUE: "bg-red-50 text-red-700",
};

const STAGE_TONE: Record<LeadStage, string> = {
  NUEVO: "bg-slate-100 text-slate-600",
  CONTACTADO: "bg-blue-50 text-blue-700",
  INTERESADO: "bg-violet-50 text-violet-700",
  AGENDADO: "bg-amber-50 text-amber-700",
  GANADO: "bg-emerald-50 text-emerald-700",
  PERDIDO: "bg-red-50 text-red-700",
};

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) notFound();

  const [invoices, leads] = await Promise.all([
    prisma.invoice.findMany({ where: { clientId: client.id }, orderBy: { date: "desc" } }),
    prisma.lead.findMany({ where: { clientId: client.id }, orderBy: { date: "desc" } }),
  ]);

  return (
    <div>
      <Link href="/clientes" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Volver a clientes
      </Link>

      <div className="card mb-6 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-lg font-semibold text-brand-700">
            {client.fullName.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-ink">{client.fullName}</h1>
            <p className="flex items-center gap-1.5 text-sm text-ink-dim">
              <Phone className="h-3.5 w-3.5" /> {client.phone ?? "Sin teléfono"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-ink-dim">Total facturado</p>
            <p className="text-lg font-semibold text-ink">{money(client.totalInvoiced)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-dim">Comisión generada</p>
            <p className="text-lg font-semibold text-ink">{money(client.totalCommission)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-dim">Primera visita</p>
            <p className="text-sm font-medium text-ink">{formatDate(client.firstVisit)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-dim">Última visita</p>
            <p className="text-sm font-medium text-ink">{formatDate(client.lastVisit)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Receipt className="h-4 w-4 text-ink-dim" /> Historial de servicios ({invoices.length})
          </h2>
          <div className="max-h-[28rem] space-y-2 overflow-y-auto scrollbar-thin pr-1">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-xl border border-black/[0.05] px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink">{inv.serviceName}</p>
                  <p className="text-xs text-ink-dim">{formatDate(inv.date)} · {inv.sellerName ?? "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink">{money(inv.price)}</p>
                  <span className={`badge ${STATUS_TONE[inv.status as InvoiceStatus]}`}>
                    {INVOICE_STATUS_LABEL[inv.status as InvoiceStatus]}
                  </span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && <p className="py-8 text-center text-sm text-ink-dim">Sin facturas registradas.</p>}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Target className="h-4 w-4 text-ink-dim" /> Leads relacionados ({leads.length})
          </h2>
          <div className="max-h-[28rem] space-y-2 overflow-y-auto scrollbar-thin pr-1">
            {leads.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border border-black/[0.05] px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink">{l.source ?? "Origen desconocido"}</p>
                  <p className="text-xs text-ink-dim">{formatDate(l.date)}</p>
                </div>
                <span className={`badge ${STAGE_TONE[l.stage as LeadStage]}`}>{LEAD_STAGE_LABEL[l.stage as LeadStage]}</span>
              </div>
            ))}
            {leads.length === 0 && <p className="py-8 text-center text-sm text-ink-dim">Sin leads asociados.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
