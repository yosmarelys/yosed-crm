import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Clock } from "lucide-react";

function formatHours(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export default async function AsistenciaPage() {
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";

  const users = await prisma.user.findMany({
    where: isAdmin ? {} : { id: session?.userId },
    orderBy: { name: "asc" },
  });

  const since = new Date();
  since.setDate(since.getDate() - 13);
  const sinceStr = since.toISOString().slice(0, 10);

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId: { in: users.map((u) => u.id) },
      date: { gte: sinceStr },
    },
    orderBy: { clockIn: "asc" },
  });

  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const byUserDay = new Map<string, number>();
  for (const e of entries) {
    const key = `${e.userId}_${e.date}`;
    const end = e.clockOut ? e.clockOut.getTime() : Date.now();
    const seconds = Math.max(0, (end - e.clockIn.getTime()) / 1000);
    byUserDay.set(key, (byUserDay.get(key) ?? 0) + seconds);
  }

  const totalsByUser = new Map<string, number>();
  for (const e of entries) {
    const end = e.clockOut ? e.clockOut.getTime() : Date.now();
    const seconds = Math.max(0, (end - e.clockIn.getTime()) / 1000);
    totalsByUser.set(e.userId, (totalsByUser.get(e.userId) ?? 0) + seconds);
  }

  return (
    <div>
      <PageHeader
        title="Asistencia"
        subtitle="Registro de entrada y salida del equipo · últimos 14 días"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {users.map((u) => (
          <div key={u.id} className="card flex items-center gap-3 p-4">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: u.color }}
            >
              {u.name.slice(0, 1)}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{u.name}</p>
              <p className="flex items-center gap-1 text-xs text-ink-dim">
                <Clock className="h-3 w-3" /> {formatHours(totalsByUser.get(u.id) ?? 0)} en 14 días
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-xs uppercase tracking-wide text-ink-dim">
              <th className="px-4 py-3 text-left font-semibold">Colaborador</th>
              {days.map((d) => (
                <th key={d} className="px-2 py-3 text-center font-semibold">
                  {new Date(d + "T12:00:00").toLocaleDateString("es", { day: "2-digit", month: "2-digit" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-black/[0.04] last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                {days.map((d) => {
                  const seconds = byUserDay.get(`${u.id}_${d}`) ?? 0;
                  const hours = seconds / 3600;
                  return (
                    <td key={d} className="px-2 py-3 text-center">
                      {seconds > 0 ? (
                        <span
                          className={`inline-flex h-7 w-12 items-center justify-center rounded-lg text-xs font-medium ${
                            hours >= 7
                              ? "bg-emerald-50 text-emerald-700"
                              : hours >= 3
                              ? "bg-amber-50 text-amber-700"
                              : "bg-black/[0.04] text-ink-dim"
                          }`}
                        >
                          {hours.toFixed(1)}h
                        </span>
                      ) : (
                        <span className="text-ink-dim/30">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
