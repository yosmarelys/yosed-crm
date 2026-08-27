"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { visibleNavItems } from "./nav-items";
import type { Role } from "@/lib/constants";

export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = visibleNavItems(role).slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-black/[0.06] bg-white/90 backdrop-blur-xl md:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 text-[10px] ${active ? "text-brand-600" : "text-ink-dim"}`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.6} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
