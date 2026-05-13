"use client";

import { useMemo, useState } from "react";
import type {
  DashboardAnalytics,
  DomainTab,
  NormalizedBill,
  NormalizedParcel,
  NormalizedSale,
  OverviewMetricKey,
} from "../../lib/dashboard/index.ts";
import {
  buildInitialDashboardViewState,
  describeDashboardViewState,
  deriveDashboardViewStateFromKpi,
} from "../../app/dashboard/lib.ts";
import AnalyticsTabs from "./analytics-tabs";
import DashboardHeader from "./dashboard-header";
import DetailDrawer from "./detail-drawer";
import OverviewGrid from "./overview-grid";
import TimeSeriesChart from "./time-series-chart";
import { formatDomainName } from "./format";

type Props = {
  analytics: DashboardAnalytics;
  domainErrors: Partial<Record<DomainTab, string>>;
  preset: string;
};

type SelectedItem = NormalizedSale | NormalizedBill | NormalizedParcel | null;

export default function DashboardScreen({
  analytics,
  domainErrors,
  preset,
}: Props) {
  const [viewState, setViewState] = useState(buildInitialDashboardViewState);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);

  const errorList = useMemo(
    () => Object.entries(domainErrors).filter((entry): entry is [DomainTab, string] => Boolean(entry[1])),
    [domainErrors]
  );
  const contextoAtivo = useMemo(
    () => describeDashboardViewState(viewState),
    [viewState]
  );

  function handleKpiSelect(key: OverviewMetricKey) {
    setViewState(deriveDashboardViewStateFromKpi(key));
    setSelectedItem(null);
  }

  function handleTabChange(tab: DomainTab) {
    setViewState((current) => ({
      ...current,
      activeTab: tab,
      filterKey: "all",
      drawerOpen: false,
      selectedUuid: null,
    }));
    setSelectedItem(null);
  }

  function handleRowClick(
    tab: DomainTab,
    row: NormalizedSale | NormalizedBill | NormalizedParcel
  ) {
    setViewState((current) => ({
      ...current,
      activeTab: tab,
      drawerOpen: true,
      selectedUuid: row.uuid,
    }));
    setSelectedItem(row);
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8fb_0%,#fffdfb_32%,#fff 100%)] text-zinc-950">
      <DashboardHeader
        startsAt={analytics.range.startsAt}
        endsAt={analytics.range.endsAt}
        label={analytics.range.label}
        preset={preset}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {errorList.length ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">Alguns domínios falharam na carga.</p>
            <ul className="mt-2 space-y-1">
              {errorList.map(([key, message]) => (
                <li key={key}>
                  <span className="font-medium">{formatDomainName(key)}</span>: {message}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <OverviewGrid overview={analytics.overview} onSelect={handleKpiSelect} />
        <TimeSeriesChart data={analytics.series} />
        <section className="rounded-lg border border-rose-100 bg-white p-4 shadow-[0_16px_44px_-34px_rgba(190,24,93,0.35)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600">
                Contexto ativo
              </p>
              <h2 className="mt-1 font-serif text-[1.45rem] font-semibold text-[#412433]">{contextoAtivo.titulo}</h2>
              <p className="mt-1 text-sm text-zinc-500">{contextoAtivo.descricao}</p>
            </div>
            {(viewState.filterKey !== "all" || viewState.activeTab !== "sales") ? (
              <button
                type="button"
                onClick={() => {
                  setViewState(buildInitialDashboardViewState());
                  setSelectedItem(null);
                }}
                className="inline-flex h-10 items-center justify-center rounded-md border border-rose-200 bg-[#fffafb] px-4 text-sm font-medium text-zinc-700 transition hover:border-rose-300 hover:text-[#412433]"
              >
                Limpar foco
              </button>
            ) : null}
          </div>
        </section>
        <AnalyticsTabs
          analytics={analytics}
          activeTab={viewState.activeTab}
          filterKey={viewState.filterKey}
          onTabChange={handleTabChange}
          onRowClick={handleRowClick}
        />
      </main>

      <DetailDrawer
        open={viewState.drawerOpen}
        tab={viewState.activeTab}
        item={selectedItem}
        onClose={() =>
          setViewState((current) => ({ ...current, drawerOpen: false, selectedUuid: null }))
        }
      />
    </div>
  );
}
