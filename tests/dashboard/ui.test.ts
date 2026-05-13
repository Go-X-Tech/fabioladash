import test from "node:test";
import assert from "node:assert/strict";

import {
  buildInitialDashboardViewState,
  deriveDashboardViewStateFromKpi,
} from "../../app/dashboard/lib.ts";

test("buildInitialDashboardViewState defaults to the sales tab", () => {
  const state = buildInitialDashboardViewState();

  assert.equal(state.activeTab, "sales");
  assert.equal(state.drawerOpen, false);
});

test("deriveDashboardViewStateFromKpi maps KPI clicks to domain filters", () => {
  const overdue = deriveDashboardViewStateFromKpi("overdue-parcels");
  const expenses = deriveDashboardViewStateFromKpi("expenses");
  const openSales = deriveDashboardViewStateFromKpi("sales-status");
  const overdueReceivables = deriveDashboardViewStateFromKpi("overdue-receivables");

  assert.equal(overdue.activeTab, "parcels");
  assert.equal(overdue.filterKey, "overdue");
  assert.equal(expenses.activeTab, "bills");
  assert.equal(expenses.filterKey, "all");
  assert.equal(openSales.activeTab, "sales");
  assert.equal(openSales.filterKey, "open-sales");
  assert.equal(overdueReceivables.activeTab, "parcels");
  assert.equal(overdueReceivables.filterKey, "overdue-receivables");
});
