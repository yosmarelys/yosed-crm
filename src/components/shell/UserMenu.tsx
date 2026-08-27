"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { logoutAction } from "@/lib/actions/session-actions";
import { ROLE_LABEL, type Role } from "@/lib/constants";

export function UserMenu({ name, role, color }: { name: string; role: Role; color: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-black/[0.05]"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {initials}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-medium text-ink">{name}</span>
          <span className="block text-[11px] text-ink-dim">{ROLE_LABEL[role]}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-dim" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-48 animate-fade-in rounded-2xl border border-black/[0.06] bg-white p-1.5 shadow-popover">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink transition hover:bg-black/[0.04]"
            >
              <LogOut className="h-4 w-4 text-ink-dim" />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
