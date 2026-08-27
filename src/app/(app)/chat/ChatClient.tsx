"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Send, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type Member = { id: string; name: string; color: string };
type Channel = { id: string; name: string; members: Member[]; lastMessage: { body: string; senderName: string; createdAt: string } | null };
type Message = { id: string; body: string; createdAt: string; sender: Member };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ChatClient({ currentUserId }: { currentUserId: string }) {
  const { data: channelData } = useSWR<{ channels: Channel[] }>("/api/chat/channels", fetcher, {
    refreshInterval: 10000,
  });
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const channels = channelData?.channels ?? [];

  useEffect(() => {
    if (!activeChannel && channels.length > 0) setActiveChannel(channels[0].id);
  }, [channels, activeChannel]);

  const { data: msgData, mutate: mutateMessages } = useSWR<{ messages: Message[] }>(
    activeChannel ? `/api/chat/messages?channelId=${activeChannel}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgData?.messages.length]);

  async function send() {
    const body = draft.trim();
    if (!body || !activeChannel) return;
    setDraft("");
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId: activeChannel, body }),
    });
    const json = await res.json();
    mutateMessages(
      (prev) => ({ messages: [...(prev?.messages ?? []), json.message] }),
      false
    );
  }

  const active = channels.find((c) => c.id === activeChannel);

  return (
    <div className="card grid h-[calc(100vh-8.5rem)] grid-cols-[240px_1fr] overflow-hidden">
      <div className="border-r border-black/[0.06] bg-black/[0.015] p-3">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-ink-dim">Canales</p>
        <div className="space-y-0.5">
          {channels.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChannel(c.id)}
              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                activeChannel === c.id ? "bg-brand-500/10 text-brand-700 font-medium" : "text-ink-dim hover:bg-black/[0.04]"
              }`}
            >
              <Hash className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 border-b border-black/[0.06] px-5 py-3.5">
          <Hash className="h-4 w-4 text-ink-dim" />
          <span className="font-semibold text-ink">{active?.name ?? "Selecciona un canal"}</span>
          <span className="ml-2 text-xs text-ink-dim">{active?.members.map((m) => m.name).join(", ")}</span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin px-5 py-4">
          {(msgData?.messages ?? []).map((m) => {
            const mine = m.sender.id === currentUserId;
            return (
              <div key={m.id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                  style={{ backgroundColor: m.sender.color }}
                >
                  {m.sender.name.slice(0, 1)}
                </span>
                <div className={`max-w-md rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-brand-500 text-white" : "bg-black/[0.05] text-ink"}`}>
                  {!mine && <p className="mb-0.5 text-[11px] font-semibold text-ink-dim">{m.sender.name}</p>}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-ink-dim/60"}`}>
                    {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-2 border-t border-black/[0.06] p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Escribe un mensaje…"
            className="input flex-1"
            disabled={!activeChannel}
          />
          <button onClick={send} disabled={!activeChannel || !draft.trim()} className="btn-primary h-[42px] w-[42px] !px-0">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
