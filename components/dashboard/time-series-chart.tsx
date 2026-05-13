"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSeriesPoint } from "../../lib/dashboard/index.ts";
import { formatCompactCurrency, formatDate } from "./format";

type Props = {
  data: DashboardSeriesPoint[];
};

export default function TimeSeriesChart({ data }: Props) {
  return (
    <section className="rounded-lg border border-rose-100 bg-white p-4 shadow-[0_18px_50px_-34px_rgba(190,24,93,0.28)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-950">Fluxo diário</h2>
        <p className="text-sm text-zinc-500">
          Vendas, despesas, saldo e recebíveis por dia no intervalo ativo.
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#f3dce6" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => formatDate(value).slice(0, 5)}
              stroke="#71717a"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              stroke="#71717a"
              tickLine={false}
              axisLine={false}
              width={84}
            />
            <Tooltip
              formatter={(value) => formatCompactCurrency(Number(value ?? 0))}
              labelFormatter={(value) => formatDate(String(value ?? ""))}
            />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#db2777" strokeWidth={2.5} dot={false} name="Vendas" />
            <Line type="monotone" dataKey="expenses" stroke="#9f1239" strokeWidth={2.5} dot={false} name="Despesas" />
            <Line type="monotone" dataKey="balance" stroke="#4338ca" strokeWidth={2.5} dot={false} name="Saldo" />
            <Line type="monotone" dataKey="receivables" stroke="#ec4899" strokeWidth={2.5} dot={false} name="Recebíveis" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
