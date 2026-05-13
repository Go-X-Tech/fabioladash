"use client";

import type {
  DashboardAnalytics,
  DomainTab,
  MetricRow,
  NormalizedBill,
  NormalizedParcel,
  NormalizedSale,
} from "../../lib/dashboard/index.ts";
import DataTable, { currencyCell, dateCell, type TableColumn } from "./data-table";
import { formatCurrency, formatDirection, formatInteger, formatStatus } from "./format";

type Props = {
  analytics: DashboardAnalytics;
  activeTab: DomainTab;
  filterKey: string;
  onTabChange: (tab: DomainTab) => void;
  onRowClick: (
    tab: DomainTab,
    row: NormalizedSale | NormalizedBill | NormalizedParcel
  ) => void;
};

function PainelDominio({
  titulo,
  descricao,
  destaque,
}: {
  titulo: string;
  descricao: string;
  destaque?: string;
}) {
  return (
    <section className="rounded-lg border border-rose-100 bg-[linear-gradient(180deg,#fffdfd_0%,#fff7fb_100%)] p-5 shadow-[0_16px_42px_-34px_rgba(190,24,93,0.25)]">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-serif text-[1.35rem] font-semibold text-[#412433]">{titulo}</h3>
          <p className="mt-1 text-sm text-zinc-500">{descricao}</p>
        </div>
        {destaque ? (
          <p className="text-sm font-medium text-zinc-700">{destaque}</p>
        ) : null}
      </div>
    </section>
  );
}

function SummaryList({
  title,
  rows,
  format = formatCurrency,
  labelFormat,
}: {
  title: string;
  rows: MetricRow[];
  format?: (value: number) => string;
  labelFormat?: (value: string) => string;
}) {
  return (
    <section className="rounded-lg border border-rose-100 bg-white p-4 shadow-[0_14px_38px_-34px_rgba(190,24,93,0.28)]">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {title}
      </h3>
      <div className="mt-4 space-y-3">
        {rows.slice(0, 5).map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <span className="truncate text-sm text-zinc-600">{labelFormat ? labelFormat(row.label) : row.label}</span>
            <span className="text-sm font-semibold text-zinc-950">{format(row.value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SalesView({
  analytics,
  filterKey,
  onRowClick,
}: {
  analytics: DashboardAnalytics;
  filterKey: string;
  onRowClick: (row: NormalizedSale) => void;
}) {
  const rows =
    filterKey === "open-sales"
      ? analytics.sales.table.filter((row) => !row.isActive)
      : analytics.sales.table;

  const columns: TableColumn<NormalizedSale>[] = [
    { key: "saleDate", label: "Data", render: (row) => dateCell(row.saleDate) },
    { key: "buyer", label: "Paciente", render: (row) => row.buyerName },
    { key: "seller", label: "Vendedor", render: (row) => row.sellerName },
    {
      key: "procedure",
      label: "Procedimento principal",
      render: (row) => row.procedures[0]?.name || "-",
    },
    { key: "status", label: "Situação", render: (row) => formatStatus(row.status) },
    { key: "final", label: "Valor final", render: (row) => currencyCell(row.finalAmount) },
    { key: "net", label: "Valor líquido", render: (row) => currencyCell(row.netAmount) },
    {
      key: "payment",
      label: "Pagamento",
      render: (row) => row.paymentMethods.map((entry) => entry.name).join(", ") || "-",
    },
  ];

  return (
    <div className="space-y-4">
      <PainelDominio
        titulo="Leitura de vendas"
        descricao="Receita detalhada por paciente, vendedora, procedimento e forma de pagamento."
        destaque={`${rows.length} vendas no foco atual`}
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <SummaryList title="Por vendedora" rows={analytics.sales.bySeller} />
        <SummaryList title="Por forma de pagamento" rows={analytics.sales.byPaymentMethod} />
        <SummaryList title="Por procedimento" rows={analytics.sales.byProcedure} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <SummaryList title="Top pacientes" rows={analytics.sales.topBuyers} />
        <SummaryList
          title="Situação"
          rows={analytics.sales.byStatus}
          format={formatInteger}
          labelFormat={formatStatus}
        />
        <SummaryList
          title="Parceladas x à vista"
          rows={analytics.sales.byPaymentProfile}
          format={formatInteger}
        />
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        emptyLabel="Nenhuma venda encontrada no periodo."
        onRowClick={onRowClick}
      />
    </div>
  );
}

function BillsView({
  analytics,
  onRowClick,
}: {
  analytics: DashboardAnalytics;
  onRowClick: (row: NormalizedBill) => void;
}) {
  const maiorDespesa = [...analytics.bills.table].sort(
    (left, right) => right.finalAmount - left.finalAmount
  )[0];
  const principalCategoria = analytics.bills.byCategory[0];
  const principalPessoa = analytics.bills.byPerson[0];

  const columns: TableColumn<NormalizedBill>[] = [
    { key: "emissionDate", label: "Emissão", render: (row) => dateCell(row.emissionDate) },
    { key: "description", label: "Descrição", render: (row) => row.description },
    { key: "type", label: "Tipo", render: (row) => row.type || "-" },
    { key: "category", label: "Categoria", render: (row) => row.categoryName },
    { key: "person", label: "Pessoa", render: (row) => row.personName },
    { key: "final", label: "Valor final", render: (row) => currencyCell(row.finalAmount) },
    { key: "balance", label: "Saldo", render: (row) => currencyCell(row.balance) },
  ];

  return (
    <div className="space-y-4">
      <PainelDominio
        titulo="Leitura de despesas"
        descricao="Mostra as saídas do período com categoria, fornecedor, valor final e saldo remanescente."
        destaque={`${analytics.bills.table.length} despesas encontradas`}
      />
      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryList
          title="Total de despesas"
          rows={[{ label: "Período", value: analytics.overview.expenses }]}
        />
        <SummaryList
          title="Principal categoria"
          rows={principalCategoria ? [principalCategoria] : []}
        />
        <SummaryList
          title="Maior fornecedor"
          rows={principalPessoa ? [principalPessoa] : []}
        />
        <SummaryList
          title="Maior despesa"
          rows={
            maiorDespesa
              ? [{ label: maiorDespesa.description, value: maiorDespesa.finalAmount }]
              : []
          }
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <SummaryList title="Por categoria" rows={analytics.bills.byCategory} />
        <SummaryList title="Por tipo" rows={analytics.bills.byType} />
        <SummaryList title="Por pessoa" rows={analytics.bills.byPerson} />
      </div>
      <DataTable
        rows={analytics.bills.table}
        columns={columns}
        emptyLabel="Nenhuma despesa encontrada no periodo."
        onRowClick={onRowClick}
      />
    </div>
  );
}

function ParcelsView({
  analytics,
  filterKey,
  onRowClick,
}: {
  analytics: DashboardAnalytics;
  filterKey: string;
  onRowClick: (row: NormalizedParcel) => void;
}) {
  const rows = analytics.parcels.table.filter((row) => {
    if (filterKey === "overdue") {
      return analytics.parcels.overdue.some((entry) => entry.uuid === row.uuid);
    }

    if (filterKey === "overdue-receivables") {
      return (
        row.type === "receivable" &&
        analytics.parcels.overdue.some((entry) => entry.uuid === row.uuid)
      );
    }

    if (filterKey === "receivable" || filterKey === "payable") {
      return row.type === filterKey;
    }

    return true;
  });

  const columns: TableColumn<NormalizedParcel>[] = [
    { key: "dueDate", label: "Vencimento", render: (row) => dateCell(row.dueDate) },
    { key: "status", label: "Situação", render: (row) => formatStatus(row.status) },
    {
      key: "account",
      label: "Conta financeira",
      render: (row) => row.financialAccountName,
    },
    { key: "method", label: "Método", render: (row) => row.paymentMethodName },
    { key: "parcel", label: "Parcela", render: (row) => row.parcelNumber || "-" },
    {
      key: "compensation",
      label: "Compensação",
      render: (row) => dateCell(row.compensationDate),
    },
  ];

  return (
    <div className="space-y-4">
      <PainelDominio
        titulo="Leitura de parcelas"
        descricao="Mostra recebimentos e pagamentos com situação, vencimento, conta financeira e método."
        destaque={`${rows.length} parcelas no foco atual`}
      />
      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryList
          title="Situação"
          rows={analytics.parcels.byStatus}
          format={formatInteger}
          labelFormat={formatStatus}
        />
        <SummaryList title="Entrada x saída" rows={analytics.parcels.byDirection} labelFormat={formatDirection} />
        <SummaryList
          title="Conta financeira"
          rows={analytics.parcels.byFinancialAccount}
        />
        <SummaryList title="Método" rows={analytics.parcels.byPaymentMethod} />
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        emptyLabel="Nenhuma parcela encontrada no periodo."
        onRowClick={onRowClick}
      />
    </div>
  );
}

export default function AnalyticsTabs({
  analytics,
  activeTab,
  filterKey,
  onTabChange,
  onRowClick,
}: Props) {
  const tabs: Array<{ key: DomainTab; label: string }> = [
    { key: "sales", label: "Vendas" },
    { key: "bills", label: "Despesas" },
    { key: "parcels", label: "Parcelas" },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const selected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium transition ${
                selected
                  ? "border-rose-300 bg-rose-100 text-[#7a3658]"
                  : "border-rose-100 bg-white text-zinc-700 hover:border-rose-200 hover:text-[#412433]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "sales" ? (
        <SalesView
          analytics={analytics}
          filterKey={filterKey}
          onRowClick={(row) => onRowClick("sales", row)}
        />
      ) : activeTab === "bills" ? (
        <BillsView analytics={analytics} onRowClick={(row) => onRowClick("bills", row)} />
      ) : (
        <ParcelsView
          analytics={analytics}
          filterKey={filterKey}
          onRowClick={(row) => onRowClick("parcels", row)}
        />
      )}
    </section>
  );
}
