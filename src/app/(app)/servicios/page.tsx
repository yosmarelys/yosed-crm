import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { PriceCell } from "./PriceCell";
import { NewServiceForm } from "./NewServiceForm";
import { Tag } from "lucide-react";

export default async function ServiciosPage() {
  const services = await prisma.serviceCatalog.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });

  const byCategory = new Map<string, typeof services>();
  for (const s of services) {
    const list = byCategory.get(s.category) ?? [];
    list.push(s);
    byCategory.set(s.category, list);
  }

  return (
    <div>
      <PageHeader
        title="Catálogo de servicios"
        subtitle={`${services.length} servicios · edita el precio haciendo clic sobre el monto`}
        action={<NewServiceForm />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[...byCategory.entries()].map(([category, list]) => (
          <div key={category} className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Tag className="h-4 w-4 text-ink-dim" /> {category}
            </h2>
            <div className="divide-y divide-black/[0.05]">
              {list.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-ink">{s.name}</span>
                  <PriceCell id={s.id} price={s.price} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
