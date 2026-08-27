"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { Bell } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, mutate } = useSWR<{ notifications: Notification[]; unread: number }>(
    "/api/notifications",
    fetcher,
    { refreshInterval: 20000 }
  );

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = data?.unread ?? 0;

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "POST",
      body: JSON.stringify({ markAllRead: true }),
    });
    mutate();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-dim transition hover:bg-black/[0.05]"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.7} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 animate-fade-in rounded-2xl border border-black/[0.06] bg-white p-2 shadow-popover">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-semibold">Notificaciones</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-brand-600 hover:underline">
                Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto scrollbar-thin">
            {(data?.notifications ?? []).length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-ink-dim">Sin notificaciones</p>
            )}
            {(data?.notifications ?? []).map((n) => (
              <Link
                key={n.id}
                href={n.link ?? "#"}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-3 py-2 transition hover:bg-black/[0.04] ${!n.read ? "bg-brand-50/60" : ""}`}
              >
                <p className="text-sm font-medium text-ink">{n.title}</p>
                {n.body && <p className="text-xs text-ink-dim">{n.body}</p>}
                <p className="mt-0.5 text-[11px] text-ink-dim/70">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
