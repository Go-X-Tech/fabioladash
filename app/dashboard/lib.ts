import {
  buildCustomDateRange,
  buildDateRangeFromPreset,
  type DateRange,
  type DomainTab,
  type OverviewMetricKey,
} from "../../lib/dashboard/index.ts";

export type DashboardViewState = {
  activeTab: DomainTab;
  filterKey: string;
  drawerOpen: boolean;
  selectedUuid: string | null;
};

export type ContextoAtivo = {
  titulo: string;
  descricao: string;
};

export function buildInitialDashboardViewState(): DashboardViewState {
  return {
    activeTab: "sales",
    filterKey: "all",
    drawerOpen: false,
    selectedUuid: null,
  };
}

export function deriveDashboardViewStateFromKpi(
  key: OverviewMetricKey
): DashboardViewState {
  switch (key) {
    case "expenses":
      return { activeTab: "bills", filterKey: "all", drawerOpen: false, selectedUuid: null };
    case "receivables":
      return { activeTab: "parcels", filterKey: "receivable", drawerOpen: false, selectedUuid: null };
    case "payables":
      return { activeTab: "parcels", filterKey: "payable", drawerOpen: false, selectedUuid: null };
    case "overdue-parcels":
      return { activeTab: "parcels", filterKey: "overdue", drawerOpen: false, selectedUuid: null };
    case "sales-status":
      return { activeTab: "sales", filterKey: "open-sales", drawerOpen: false, selectedUuid: null };
    case "net-revenue":
      return { activeTab: "sales", filterKey: "all", drawerOpen: false, selectedUuid: null };
    case "overdue-receivables":
      return { activeTab: "parcels", filterKey: "overdue-receivables", drawerOpen: false, selectedUuid: null };
    case "gross-revenue":
    case "sales-count":
    case "average-ticket":
    case "operating-balance":
    default:
      return { activeTab: "sales", filterKey: "all", drawerOpen: false, selectedUuid: null };
  }
}

export function describeDashboardViewState(state: Pick<DashboardViewState, "activeTab" | "filterKey">): ContextoAtivo {
  if (state.activeTab === "bills") {
    return {
      titulo: "Despesas do período",
      descricao: "Tabela e análises de contas e fornecedores no intervalo selecionado.",
    };
  }

  if (state.activeTab === "parcels") {
    if (state.filterKey === "overdue") {
      return {
        titulo: "Parcelas vencidas",
        descricao: "Mostrando apenas parcelas atrasadas e ainda em aberto.",
      };
    }

    if (state.filterKey === "overdue-receivables") {
      return {
        titulo: "Recebíveis vencidos",
        descricao: "Mostrando apenas parcelas a receber já vencidas e ainda não compensadas.",
      };
    }

    if (state.filterKey === "receivable") {
      return {
        titulo: "Contas a receber",
        descricao: "Mostrando somente parcelas classificadas como entrada.",
      };
    }

    if (state.filterKey === "payable") {
      return {
        titulo: "Contas a pagar",
        descricao: "Mostrando somente parcelas classificadas como saída.",
      };
    }

    return {
      titulo: "Fluxo de parcelas",
      descricao: "Distribuição de recebimentos, pagamentos, contas e vencimentos.",
    };
  }

  if (state.filterKey === "open-sales") {
    return {
      titulo: "Vendas não fechadas",
      descricao: "Mostrando vendas inativas ou ainda não concluídas dentro do período.",
    };
  }

  return {
    titulo: "Vendas do período",
    descricao: "Receita, pacientes, procedimentos e formas de pagamento no intervalo selecionado.",
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

function clampDateToToday(value: string, now: Date): string {
  const today = now.toISOString().slice(0, 10);
  return value > today ? today : value;
}

function getSearchParam(
  searchParams: SearchParams,
  key: string
): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export function resolveDashboardDateRange(
  searchParams: SearchParams,
  now = new Date()
): { range: DateRange; preset: string } {
  const preset = getSearchParam(searchParams, "preset");
  const startsAt = getSearchParam(searchParams, "starts_at");
  const endsAt = getSearchParam(searchParams, "ends_at");

  if (startsAt && endsAt) {
    const safeEndsAt = clampDateToToday(endsAt, now);
    return {
      range: buildCustomDateRange(startsAt, safeEndsAt),
      preset: preset || "custom",
    };
  }

  switch (preset) {
    case "today":
    case "7-days":
    case "30-days":
    case "previous-month":
      return { range: buildDateRangeFromPreset(preset, now), preset };
    case "current-month":
    default:
      return {
        range: buildDateRangeFromPreset("current-month", now),
        preset: "current-month",
      };
  }
}
