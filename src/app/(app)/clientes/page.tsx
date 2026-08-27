import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Users, Phone, Calendar } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function formatDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
}

const PAGE_SIZE = 25;

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const where = q
    ? { OR: [{ fullName: { contains: q, mode: "insensitive" as const } }, { phone: { contains: q } }] }
    : {};

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { lastVisit: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.client.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${total.toLocaleString()} clientes en la base de datos`}
      />

      <div className="mb-4">
        <SearchInput placeholder="Buscar por nombre o teléfono…" />
      </div>

      <div className="card overflow-hidden">
        <div className="hidden grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_1fr] gap-3 border-b border-black/[0.06] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-dim md:grid">
          <span>Cliente</span>
          <span>Teléfono</span>
          <span className="text-right">Servicios</span>
          <span className="text-right">Total facturado</span>
          <span>Primera visita</span>
          <span>Última visita</span>
        </div>
        <div className="divide-y divide-black/[0.05]">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/clientes/${c.id}`}
              className="grid grid-cols-1 gap-2 px-5 py-3.5 transition hover:bg-black/[0.02] md:grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_1fr] md:items-center md:gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {c.fullName.slice(0, 2).toUpperCase()}
                </span>
                <span className="font-medium text-ink">{c.fullName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-ink-dim md:block">
                <Phone className="h-3.5 w-3.5 md:hidden" />
                {c.phone ?? "—"}
              </div>
              <div className="text-sm text-ink-dim md:text-right">
                {(c.notes?.split(";").length ?? 0) || "—"}
              </div>
              <div className="text-sm font-medium text-ink md:text-right">{money(c.totalInvoiced)}</div>
              <div className="text-sm text-ink-dim">{formatDate(c.firstVisit)}</div>
              <div className="text-sm text-ink-dim">{formatDate(c.lastVisit)}</div>
            </Link>
          ))}
          {clients.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-ink-dim">
              <Users className="h-8 w-8" />
              <p className="text-sm">No se encontraron clientes.</p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }).slice(0, 12).map((_, i) => (
            <Link
              key={i}
              href={`/clientes?${new URLSearchParams({ ...(q ? { q } : {}), page: String(i + 1) })}`}
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
