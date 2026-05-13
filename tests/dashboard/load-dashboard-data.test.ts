import test from "node:test";
import assert from "node:assert/strict";

import { loadDashboardData } from "../../lib/dashboard/load-dashboard-data.ts";

test("loadDashboardData accumulates paginated resources and tolerates optional enrichment failures", async () => {
  const calls: string[] = [];
  const salesParams: Array<Record<string, string> | undefined> = [];
  const billsParams: Array<Record<string, string> | undefined> = [];
  const parcelsParams: Array<Record<string, string> | undefined> = [];

  const data = await loadDashboardData(
    { startsAt: "2026-05-01", endsAt: "2026-05-31", label: "Mes atual" },
    async (path, params) => {
      calls.push(`${path}?page=${params?.page ?? "1"}`);
      if (path === "/sales") {
        salesParams.push(params);
      }
      if (path === "/bills") {
        billsParams.push(params);
      }
      if (path === "/parcels") {
        parcelsParams.push(params);
      }

      if (path === "/sales") {
        return params?.page === "2"
          ? { data: [{ uuid: "sale-2", final_amount: "5000", sale_date: "2026-05-03" }], meta: { current_page: 2, last_page: 2 } }
          : { data: [{ uuid: "sale-1", final_amount: "10000", sale_date: "2026-05-02" }], meta: { current_page: 1, last_page: 2 } };
      }

      if (path === "/bills") {
        return { data: [{ uuid: "bill-1", final_amount: "4000", emission_date: "2026-05-02" }], meta: { current_page: 1, last_page: 1 } };
      }

      if (path === "/parcels") {
        return { data: [{ uuid: "parcel-1", due_date: "2026-05-07", amount: "2000", type: "receivable", status: "open" }], meta: { current_page: 1, last_page: 1 } };
      }

      if (path === "/patients") {
        throw new Error("patients unavailable");
      }

      if (path === "/financial-categories") {
        return { data: [{ uuid: "cat-1", name: "Marketing" }], meta: { current_page: 1, last_page: 1 } };
      }

      throw new Error(`Unexpected path ${path}`);
    }
  );

  assert.equal(data.sales.length, 2);
  assert.equal(data.bills.length, 1);
  assert.equal(data.parcels.length, 1);
  assert.equal(data.sales[0]?.finalAmount, 100);
  assert.equal(data.sales[1]?.finalAmount, 50);
  assert.equal(data.bills[0]?.finalAmount, 40);
  assert.equal(data.parcels[0]?.amount, 20);
  assert.equal(data.patients.length, 0);
  assert.equal(data.financialCategories.length, 1);
  assert.equal(calls.includes("/sales?page=1"), true);
  assert.equal(calls.includes("/sales?page=2"), true);
  assert.equal(salesParams[0]?.starts_at, "2026-05-01T00:00:00-03:00");
  assert.equal(salesParams[0]?.ends_at, "2026-05-31T23:59:59-03:00");
  assert.equal(billsParams[0]?.starts_at, "2026-05-01T00:00:00-03:00");
  assert.equal(billsParams[0]?.ends_at, "2026-05-31T23:59:59-03:00");
  assert.equal(billsParams[0]?.start_date, "2026-05-01T00:00:00-03:00");
  assert.equal(billsParams[0]?.end_date, "2026-05-31T23:59:59-03:00");
  assert.equal(parcelsParams[0]?.starts_at, "2026-05-01T00:00:00-03:00");
  assert.equal(parcelsParams[0]?.ends_at, "2026-05-31T23:59:59-03:00");
  assert.equal(parcelsParams[0]?.start_date, "2026-05-01T00:00:00-03:00");
  assert.equal(parcelsParams[0]?.end_date, "2026-05-31T23:59:59-03:00");
});
