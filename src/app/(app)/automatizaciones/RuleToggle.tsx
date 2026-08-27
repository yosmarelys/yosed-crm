"use client";

import { useState, useTransition } from "react";
import { toggleRule } from "./actions";

export function RuleToggle({ id, enabled }: { id: string; enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  const [, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        setOn(!on);
        startTransition(() => toggleRule(id, !on));
      }}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-emerald-500" : "bg-black/[0.15]"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}
