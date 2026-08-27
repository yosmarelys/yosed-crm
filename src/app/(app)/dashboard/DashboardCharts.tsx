"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const currencyFmt = (v: number) => `$${(v / 1000).toFixed(1)}k`;

export function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number; commission: number }[];
}) {
  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-dim">Aún no hay datos suficientes.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ left: -10, right: 10 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3366ff" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3366ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="comGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={currencyFmt} tick={{ fontSize: 12, fill: "#6e6e73" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          formatter={(v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
          contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", fontSize: 13 }}
        />
        <Area type="monotone" dataKey="revenue" name="Facturación" stroke="#3366ff" strokeWidth={2} fill="url(#revGrad)" />
        <Area type="monotone" dataKey="commission" name="Comisión" stroke="#14b8a6" strokeWidth={2} fill="url(#comGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FunnelChart({ data }: { data: { stage: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.stage}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-ink">{d.stage}</span>
            <span className="text-ink-dim">{d.count}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.05]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MiniBarChart({ data, dataKey, color }: { data: any[]; dataKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <BarChart data={data}>
        <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
