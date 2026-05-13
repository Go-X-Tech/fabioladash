import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDateRangeFromPreset,
  classifyParcel,
  computeDashboardAnalytics,
  normalizeBill,
  normalizeParcel,
  normalizeSale,
} from "../../lib/dashboard/index.ts";

test("buildDateRangeFromPreset returns the current month start and today as end", () => {
  const range = buildDateRangeFromPreset("current-month", new Date("2026-05-12T12:00:00Z"));

  assert.equal(range.startsAt, "2026-05-01");
  assert.equal(range.endsAt, "2026-05-12");
  assert.equal(range.label, "Mes atual");
});

test("normalizeSale derives buyer, seller, active status, and net amount", () => {
  const sale = normalizeSale({
    uuid: "sale-1",
    type: "sale",
    name: "Venda Botox",
    sale_date: "2026-05-10",
    due_date: "2026-05-20",
    status: "active",
    buyer: { uuid: "p1", name: "Ana" },
    seller: { uuid: "s1", name: "Dra. Paula" },
    nominal_amount: "150050",
    discount_amount: "10050",
    addition_amount: "0",
    final_amount: "140000",
    payment_methods: [
      { uuid: "pm-1", name: "Cartao", amount: "140000", fees_amount: "5600" },
    ],
    procedures: [{ uuid: "proc-1", name: "Botox" }],
  });

  assert.equal(sale.buyerName, "Ana");
  assert.equal(sale.sellerName, "Dra. Paula");
  assert.equal(sale.isActive, true);
  assert.equal(sale.finalAmount, 1400);
  assert.equal(sale.paymentMethods[0]?.amount, 1400);
  assert.equal(sale.feesAmount, 56);
  assert.equal(sale.netAmount, 1344);
});

test("normalizeBill keeps linked parcels from nested payment methods", () => {
  const bill = normalizeBill({
    uuid: "bill-1",
    type: "bill",
    description: "Fornecedor laser",
    nominal_amount: "50000",
    discount_amount: "0",
    fees_amount: "2000",
    final_amount: "52000",
    net_amount: "52000",
    balance: "20000",
    emission_date: "2026-05-04",
    category: { uuid: "cat-1", name: "Equipamentos" },
    person: { uuid: "person-1", name: "Laser Co" },
    payment_methods: [
      {
        uuid: "pm-1",
        name: "Boleto",
        parcels: [{ uuid: "parcel-from-bill", due_date: "2026-05-25", amount: "26000" }],
      },
    ],
  });

  assert.equal(bill.parcels.length, 1);
  assert.equal(bill.parcels[0]?.uuid, "parcel-from-bill");
  assert.equal(bill.finalAmount, 520);
  assert.equal(bill.balance, 200);
  assert.equal(bill.parcels[0]?.amount, 260);
  assert.equal(bill.categoryName, "Equipamentos");
});

test("classifyParcel marks overdue receivable parcels", () => {
  const parcel = normalizeParcel({
    uuid: "parcel-1",
    type: "receivable",
    status: "open",
    due_date: "2026-05-01",
    amount: "32000",
    payment_method: { name: "Pix" },
    financial_account: { name: "Caixa" },
  });

  const classification = classifyParcel(parcel, new Date("2026-05-12T12:00:00Z"));

  assert.equal(classification.direction, "receivable");
  assert.equal(classification.isOpen, true);
  assert.equal(classification.isOverdue, true);
});

test("computeDashboardAnalytics aggregates overview, series, and domain rankings", () => {
  const sales = [
    normalizeSale({
      uuid: "sale-1",
      type: "sale",
      name: "Venda 1",
      sale_date: "2026-05-10",
      status: "active",
      buyer: { name: "Ana" },
      seller: { name: "Dra. Paula" },
      final_amount: "100000",
      nominal_amount: "100000",
      discount_amount: "0",
      addition_amount: "0",
      payment_methods: [{ name: "Cartao", amount: "100000", fees_amount: "4000" }],
      procedures: [{ name: "Botox" }],
    }),
    normalizeSale({
      uuid: "sale-2",
      type: "sale",
      name: "Venda 2",
      sale_date: "2026-05-11",
      status: "inactive",
      buyer: { name: "Bia" },
      seller: { name: "Dra. Paula" },
      final_amount: "50000",
      nominal_amount: "50000",
      discount_amount: "0",
      addition_amount: "0",
      payment_methods: [{ name: "Pix", amount: "50000", fees_amount: "0" }],
      procedures: [{ name: "Peeling" }],
    }),
  ];

  const bills = [
    normalizeBill({
      uuid: "bill-1",
      type: "bill",
      description: "Aluguel",
      final_amount: "40000",
      nominal_amount: "40000",
      discount_amount: "0",
      fees_amount: "0",
      net_amount: "40000",
      balance: "0",
      emission_date: "2026-05-10",
      category: { name: "Fixo" },
      person: { name: "Imobiliaria" },
    }),
  ];

  const parcels = [
    normalizeParcel({
      uuid: "parcel-1",
      type: "receivable",
      status: "open",
      due_date: "2026-05-09",
      amount: "30000",
      payment_method: { name: "Cartao" },
      financial_account: { name: "Conta A" },
    }),
    normalizeParcel({
      uuid: "parcel-2",
      type: "payable",
      status: "open",
      due_date: "2026-05-13",
      amount: "15000",
      payment_method: { name: "Boleto" },
      financial_account: { name: "Conta B" },
    }),
  ];

  const analytics = computeDashboardAnalytics(
    { sales, bills, parcels, patients: [], financialCategories: [] },
    { startsAt: "2026-05-01", endsAt: "2026-05-31", label: "Mes atual" },
    new Date("2026-05-12T12:00:00Z")
  );

  assert.equal(analytics.overview.grossRevenue, 1500);
  assert.equal(analytics.overview.netRevenue, 1460);
  assert.equal(analytics.overview.expenses, 400);
  assert.equal(analytics.overview.operatingBalance, 1100);
  assert.equal(analytics.overview.receivables, 300);
  assert.equal(analytics.overview.payables, 150);
  assert.equal(analytics.overview.overdueParcels, 1);
  assert.equal(analytics.overview.overdueReceivablesAmount, 300);
  assert.equal(analytics.overview.activeSalesRate, 0.5);
  assert.equal(analytics.overview.openSalesCount, 1);
  assert.equal(analytics.overview.openSalesValue, 500);
  assert.equal(analytics.sales.bySeller[0]?.label, "Dra. Paula");
  assert.equal(analytics.bills.byCategory[0]?.label, "Fixo");
  assert.equal(analytics.parcels.byStatus[0]?.label, "open");
  assert.equal(analytics.series.find((entry) => entry.date === "2026-05-10")?.sales, 1000);
});
