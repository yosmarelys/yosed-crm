"use client";

import { useState, useTransition } from "react";
import { updateServicePrice } from "./actions";

export function PriceCell({ id, price }: { id: string; price: number }) {
  const [value, setValue] = useState(String(price));
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <span className="text-ink-dim">$</span>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          const n = parseFloat(value);
          if (!Number.isNaN(n) && n !== price) startTransition(() => updateServicePrice(id, n));
        }}
        className="w-20 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-sm font-medium text-ink transition hover:border-black/[0.08] hover:bg-black/[0.02] focus:border-brand-400 focus:bg-white focus:outline-none"
      />
      {pending && <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-brand-400" />}
    </div>
  );
}
