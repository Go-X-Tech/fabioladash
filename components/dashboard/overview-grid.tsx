"use client";

import type { DashboardOverview, OverviewMetricKey } from "../../lib/dashboard/index.ts";
import { formatCurrency, formatInteger, formatPercent } from "./format";

type Props = {
  overview: DashboardOverview;
  onSelect: (key: OverviewMetricKey) => void;
};

const metricConfig: Array<{
  key: OverviewMetricKey;
  label: string;
  value: (overview: DashboardOverview) => string;
  tone: string;
}> = [
  {
    key: "gross-revenue",
    label: "Faturamento bruto",
    value: (overview) => formatCurrency(overview.grossRevenue),
    tone: "text-rose-700",
  },
  {
    key: "net-revenue",
    label: "Receita líquida",
    value: (overview) => formatCurrency(overview.netRevenue),
    tone: "text-zinc-950",
  },
  {
    key: "sales-count",
    label: "Quantidade de vendas",
    value: (overview) => formatInteger(overview.salesCount),
    tone: "text-zinc-900",
  },
  {
    key: "sales-status",
    label: "Vendas não fechadas",
    value: (overview) => `${formatInteger(overview.openSalesCount)} • ${formatCurrency(overview.openSalesValue)}`,
    tone: "text-amber-700",
  },
  {
    key: "expenses",
    label: "Despesas",
    value: (overview) => formatCurrency(overview.expenses),
    tone: "text-rose-700",
  },
  {
    key: "average-ticket",
    label: "Ticket médio",
    value: (overview) => formatCurrency(overview.averageTicket),
    tone: "text-zinc-900",
  },
  {
    key: "discount-rate",
    label: "Taxa de desconto",
    value: (overview) => formatPercent(overview.discountRate),
    tone: "text-zinc-900",
  },
  {
    key: "overdue-receivables",
    label: "Recebíveis vencidos",
    value: (overview) => formatCurrency(overview.overdueReceivablesAmount),
    tone: "text-rose-700",
  },
  {
    key: "operating-balance",
    label: "Saldo operacional",
    value: (overview) => formatCurrency(overview.operatingBalance),
    tone: "text-emerald-700",
  },
  {
    key: "payables",
    label: "Contas a pagar",
    value: (overview) => formatCurrency(overview.payables),
    tone: "text-zinc-900",
  },
  {
    key: "overdue-parcels",
    label: "Parcelas vencidas",
    value: (overview) => formatInteger(overview.overdueParcels),
    tone: "text-rose-700",
  },
];

export default function OverviewGrid({ overview, onSelect }: Props) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metricConfig.map((metric) => (
        <button
          key={metric.key}
          type="button"
          onClick={() => onSelect(metric.key)}
          className="group relative flex min-h-32 flex-col justify-between overflow-hidden rounded-lg border border-rose-100 bg-white p-4 text-left shadow-[0_12px_40px_-28px_rgba(190,24,93,0.45)] transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-[0_18px_50px_-28px_rgba(190,24,93,0.38)]"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-200 via-pink-100 to-white" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            {metric.label}
          </span>
          <div className="space-y-1">
            <strong className={`block text-2xl font-semibold ${metric.tone}`}>
              {metric.value(overview)}
            </strong>
            <p className="text-sm text-zinc-500">Clique para aprofundar a leitura</p>
          </div>
        </button>
      ))}
    </section>
  );
}
