import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { NewInvoiceDrawer } from "./NewInvoiceDrawer";
import { MarkPaidButton } from "./MarkPaidButton";
import { INVOICE_STATUS_LABEL, INVOICE_STATUSES, type InvoiceStatus } from "@/lib/constants";

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

const PAGE_SIZE = 30;

export default async function FacturacionPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const status = searchParams.status ?? "ALL";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const where: any = {};
  if (q) where.OR = [{ clientName: { contains: q } }, { clientPhone: { contains: q } }];
  if (status !== "ALL") where.status = status;

  const [invoices, total, sellers, services, sums] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.invoice.count({ where }),
    prisma.user.findMany({ where: { role: { in: ["ADMIN", "VENTAS"] } }, select: { id: true, name: true } }),
    prisma.serviceCatalog.findMany({ select: { id: true, name: true, price: true }, orderBy: { name: "asc" } }),
    prisma.invoice.aggregate({ where, _sum: { price: true, commission: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Facturación"
        subtitle={`${total.toLocaleString()} facturas · ${money(sums._sum.price ?? 0)} facturado · ${money(sums._sum.commission ?? 0)} en comisiones`}
        action={<NewInvoiceDrawer sellers={sellers} services={services} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Buscar cliente o teléfono…" />
        <div className="flex gap-1.5 rounded-full bg-black/[0.04] p-1">
          {(["ALL", ...INVOICE_STATUSES] as const).map((s) => (
            <Link
              key={s}
              href={`/facturacion?${new URLSearchParams({ ...(q ? { q } : {}), status: s })}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                status === s ? "bg-white shadow-sm text-ink" : "text-ink-dim hover:text-ink"
              }`}
            >
              {s === "ALL" ? "Todas" : INVOICE_STATUS_LABEL[s]}
            </Link>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden grid-cols-[1fr_1.6fr_1.4fr_0.9fr_0.9fr_0.9fr_auto] gap-3 border-b border-black/[0.06] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-dim md:grid">
          <span>Fecha</span>
          <span>Cliente</span>
          <span>Servicio</span>
          <span className="text-right">Precio</span>
          <span className="text-right">Comisión</span>
          <span>Estado</span>
          <span />
        </div>
        <div className="divide-y divide-black/[0.05]">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-2 gap-2 px-5 py-3.5 md:grid-cols-[1fr_1.6fr_1.4fr_0.9fr_0.9fr_0.9fr_auto] md:items-center md:gap-3"
            >
              <span className="text-sm text-ink-dim">{formatDate(inv.date)}</span>
              <div>
                <p className="text-sm font-medium text-ink">{inv.clientName}</p>
                <p className="text-xs text-ink-dim">{inv.sellerName ?? "Sin vendedor"}</p>
              </div>
              <span className="text-sm text-ink-dim">{inv.serviceName}</span>
              <span className="text-sm font-medium text-ink md:text-right">{money(inv.price)}</span>
              <span className="text-sm text-ink-dim md:text-right">{money(inv.commission)}</span>
              <span className={`badge w-fit ${STATUS_TONE[inv.status as InvoiceStatus]}`}>
                {INVOICE_STATUS_LABEL[inv.status as InvoiceStatus]}
              </span>
              <span>{inv.status !== "PAID" && <MarkPaidButton id={inv.id} />}</span>
            </div>
          ))}
          {invoices.length === 0 && (
            <p className="py-16 text-center text-sm text-ink-dim">No hay facturas que coincidan con el filtro.</p>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }).slice(0, 12).map((_, i) => (
            <Link
              key={i}
              href={`/facturacion?${new URLSearchParams({ ...(q ? { q } : {}), status, page: String(i + 1) })}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                page === i + 1 ? "bg-brand-500 text-white" : "text-ink-dim hover:bg-black/[0.05]"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
