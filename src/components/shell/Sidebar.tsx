"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { visibleNavItems } from "./nav-items";
import type { Role } from "@/lib/constants";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = visibleNavItems(role);

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[76px] flex-col items-center border-r border-black/[0.06] bg-white/80 py-4 backdrop-blur-xl md:flex">
      <Link
        href="/dashboard"
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30"
      >
        <Sparkles className="h-5 w-5 text-white" strokeWidth={1.75} />
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto scrollbar-thin py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex h-12 w-14 flex-col items-center justify-center gap-1 rounded-xl transition ${
                active ? "bg-brand-500/10 text-brand-600" : "text-ink-dim hover:bg-black/[0.04] hover:text-ink"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
              )}
              <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2 : 1.6} />
              <span className="text-[9.5px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
