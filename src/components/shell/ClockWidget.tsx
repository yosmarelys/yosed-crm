"use client";

import { useEffect, useState, useCallback } from "react";
import useSWR from "swr";
import { Play, Square } from "lucide-react";

type ClockData = { active: boolean; since: string | null; todaySeconds: number };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function ClockWidget() {
  const { data, mutate, isLoading } = useSWR<ClockData>("/api/clock", fetcher, {
    refreshInterval: 30000,
  });
  const [, setTick] = useState(0);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const liveSeconds = (() => {
    if (!data) return 0;
    if (!data.active || !data.since) return data.todaySeconds;
    const elapsed = (Date.now() - new Date(data.since).getTime()) / 1000;
    return data.todaySeconds + Math.max(0, elapsed);
  })();

  const toggle = useCallback(async () => {
    setPending(true);
    try {
      const res = await fetch("/api/clock", { method: "POST" });
      const json = await res.json();
      mutate(json, false);
    } finally {
      setPending(false);
    }
  }, [mutate]);

  const active = data?.active ?? false;

  return (
    <button
      onClick={toggle}
      disabled={isLoading || pending}
      className={`flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition active:scale-[0.98] disabled:opacity-60 ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-black/[0.08] bg-black/[0.03] text-ink-dim hover:bg-black/[0.06]"
      }`}
      title={active ? "Marcar salida" : "Marcar entrada"}
    >
      <span className={`relative flex h-2 w-2 ${active ? "" : ""}`}>
        {active && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-ink-dim/40"}`} />
      </span>
      <span className="tabular-nums">{formatDuration(liveSeconds)}</span>
      {active ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
    </button>
  );
}
