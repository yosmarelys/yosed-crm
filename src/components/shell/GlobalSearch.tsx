"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Target } from "lucide-react";

type Client = { id: string; fullName: string; phone: string | null };
type Lead = { id: string; firstName: string | null; lastName: string | null; phone: string | null; stage: string };

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<{ clients: Client[]; leads: Lead[] }>({ clients: [], leads: [] });
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults({ clients: [], leads: [] });
      return;
    }
    const id = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults(await res.json());
    }, 220);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim/60" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar cliente, teléfono o lead…"
          className="input !pl-9 !bg-black/[0.03] !border-transparent focus:!bg-white"
        />
      </div>

      {open && (results.clients.length > 0 || results.leads.length > 0) && (
        <div className="absolute left-0 right-0 z-40 mt-2 max-h-96 animate-fade-in space-y-1 overflow-y-auto scrollbar-thin rounded-2xl border border-black/[0.06] bg-white p-2 shadow-popover">
          {results.clients.length > 0 && (
            <div>
              <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">Clientes</p>
              {results.clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/clientes/${c.id}`);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left hover:bg-black/[0.04]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                    <User className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-ink">{c.fullName}</span>
                    <span className="block text-xs text-ink-dim">{c.phone}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {results.leads.length > 0 && (
            <div>
              <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">Leads</p>
              {results.leads.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/leads?highlight=${l.id}`);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left hover:bg-black/[0.04]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-violet/10 text-accent-violet">
                    <Target className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-ink">
                      {[l.firstName, l.lastName].filter(Boolean).join(" ") || "Sin nombre"}
                    </span>
                    <span className="block text-xs text-ink-dim">{l.phone}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
