export type DashboardPreset =
  | "today"
  | "7-days"
  | "30-days"
  | "current-month"
  | "previous-month";

export type DateRange = {
  startsAt: string;
  endsAt: string;
  label: string;
};

export type DomainTab = "sales" | "bills" | "parcels";
export type Direction = "receivable" | "payable" | "unknown";

type NamedEntity = {
  uuid?: string;
  name?: string;
};

export type NormalizedParcelLink = {
  uuid: string;
  amount: number;
  dueDate: string | null;
  status: string;
};

export type NormalizedPaymentMethod = {
  uuid: string;
  name: string;
  amount: number;
  feesAmount: number;
  parcels: NormalizedParcelLink[];
};

export type NormalizedProcedure = {
  uuid: string;
  name: string;
};

export type NormalizedSale = {
  uuid: string;
  type: string;
  name: string;
  saleDate: string | null;
  dueDate: string | null;
  status: string;
  buyerName: string;
  sellerName: string;
  nominalAmount: number;
  discountAmount: number;
  additionAmount: number;
  finalAmount: number;
  feesAmount: number;
  netAmount: number;
  isActive: boolean;
  paymentMethods: NormalizedPaymentMethod[];
  procedures: NormalizedProcedure[];
  raw: Record<string, unknown>;
};

export type NormalizedBill = {
  uuid: string;
  type: string;
  description: string;
  amount: number;
  nominalAmount: number;
  discountAmount: number;
  feesAmount: number;
  finalAmount: number;
  netAmount: number;
  balance: number;
  emissionDate: string | null;
  categoryName: string;
  personName: string;
  paymentMethods: NormalizedPaymentMethod[];
  parcels: NormalizedParcelLink[];
  raw: Record<string, unknown>;
};

export type NormalizedParcel = {
  uuid: string;
  type: string;
  dueDate: string | null;
  executionDate: string | null;
  compensationDate: string | null;
  calcCompensationDate: string | null;
  status: string;
  parcelNumber: string;
  paymentMethodName: string;
  financialAccountName: string;
  amount: number;
  raw: Record<string, unknown>;
};

export type DashboardData = {
  sales: NormalizedSale[];
  bills: NormalizedBill[];
  parcels: NormalizedParcel[];
  patients: Record<string, unknown>[];
  financialCategories: Record<string, unknown>[];
};

export type MetricRow = {
  label: string;
  value: number;
};

export type OverviewMetricKey =
  | "gross-revenue"
  | "net-revenue"
  | "sales-count"
  | "average-ticket"
  | "discount-rate"
  | "expenses"
  | "operating-balance"
  | "receivables"
  | "overdue-receivables"
  | "payables"
  | "overdue-parcels"
  | "sales-status";

export type DashboardOverview = {
  grossRevenue: number;
  netRevenue: number;
  salesCount: number;
  averageTicket: number;
  expenses: number;
  operatingBalance: number;
  receivables: number;
  payables: number;
  overdueParcels: number;
  overdueReceivablesAmount: number;
  activeSalesRate: number;
  inactiveSalesRate: number;
  totalNetRevenue: number;
  totalDiscounts: number;
  totalPaymentFees: number;
  openSalesCount: number;
  openSalesValue: number;
  discountRate: number;
};

export type DashboardSeriesPoint = {
  date: string;
  sales: number;
  expenses: number;
  balance: number;
  receivables: number;
};

export type DashboardAnalytics = {
  range: DateRange;
  overview: DashboardOverview;
  series: DashboardSeriesPoint[];
  sales: {
    bySeller: MetricRow[];
    byPaymentMethod: MetricRow[];
    byProcedure: MetricRow[];
    topBuyers: MetricRow[];
    byStatus: MetricRow[];
    byPaymentProfile: MetricRow[];
    table: NormalizedSale[];
  };
  bills: {
    byCategory: MetricRow[];
    byType: MetricRow[];
    byPerson: MetricRow[];
    topBills: MetricRow[];
    table: NormalizedBill[];
  };
  parcels: {
    byStatus: MetricRow[];
    byDirection: MetricRow[];
    byFinancialAccount: MetricRow[];
    byPaymentMethod: MetricRow[];
    overdue: NormalizedParcel[];
    table: NormalizedParcel[];
  };
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function asNullableString(value: unknown): string | null {
  const text = asString(value).trim();
  return text ? text : null;
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return 0;

    const lastComma = trimmed.lastIndexOf(",");
    const lastDot = trimmed.lastIndexOf(".");
    let normalized = trimmed;

    if (lastComma > -1 && lastDot > -1) {
      const decimalSeparator = lastComma > lastDot ? "," : ".";
      if (decimalSeparator === ",") {
        normalized = trimmed.replace(/\./g, "").replace(",", ".");
      } else {
        normalized = trimmed.replace(/,/g, "");
      }
    } else if (lastComma > -1) {
      normalized = trimmed.replace(",", ".");
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeNamedEntity(value: unknown): NamedEntity {
  const record = asRecord(value);
  return {
    uuid: asNullableString(record.uuid) ?? undefined,
    name: asString(record.name),
  };
}

function normalizeParcelLink(value: unknown): NormalizedParcelLink {
  const record = asRecord(value);
  return {
    uuid: asString(record.uuid) || crypto.randomUUID(),
    amount: pickMoneyAmount(record),
    dueDate: asNullableString(record.due_date),
    status: asString(record.status),
  };
}

function normalizePaymentMethod(value: unknown): NormalizedPaymentMethod {
  const record = asRecord(value);
  return {
    uuid: asString(record.uuid) || crypto.randomUUID(),
    name: asString(record.name) || asString(record.description) || "Nao informado",
    amount: pickMoneyAmount(record),
    feesAmount: centsToCurrency(record.fees_amount),
    parcels: asArray(record.parcels).map(normalizeParcelLink),
  };
}

function centsToCurrency(value: unknown): number {
  return asNumber(value) / 100;
}

function normalizeProcedure(value: unknown): NormalizedProcedure {
  const record = asRecord(value);
  return {
    uuid: asString(record.uuid) || crypto.randomUUID(),
    name: asString(record.name) || "Nao informado",
  };
}

function pickMoneyAmount(record: Record<string, unknown>): number {
  return (
    centsToCurrency(record.amount) ||
    centsToCurrency(record.final_amount) ||
    centsToCurrency(record.net_amount) ||
    centsToCurrency(record.nominal_amount) ||
    centsToCurrency(record.balance)
  );
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function dateOnly(value: string | null): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

export function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function buildDateRangeFromPreset(preset: DashboardPreset, now = new Date()): DateRange {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  switch (preset) {
    case "today":
      return { startsAt: formatDate(today), endsAt: formatDate(today), label: "Hoje" };
    case "7-days":
      return {
        startsAt: formatDate(addDays(today, -6)),
        endsAt: formatDate(today),
        label: "7 dias",
      };
    case "30-days":
      return {
        startsAt: formatDate(addDays(today, -29)),
        endsAt: formatDate(today),
        label: "30 dias",
      };
    case "previous-month": {
      const anchor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
      return {
        startsAt: formatDate(startOfMonth(anchor)),
        endsAt: formatDate(endOfMonth(anchor)),
        label: "Mes anterior",
      };
    }
    case "current-month":
    default:
      return {
        startsAt: formatDate(startOfMonth(today)),
        endsAt: formatDate(today),
        label: "Mes atual",
      };
  }
}

export function buildCustomDateRange(startsAt: string, endsAt: string): DateRange {
  return {
    startsAt,
    endsAt,
    label: startsAt === endsAt ? startsAt : `${startsAt} a ${endsAt}`,
  };
}

export function normalizeSale(value: unknown): NormalizedSale {
  const record = asRecord(value);
  const paymentMethods = asArray(record.payment_methods).map(normalizePaymentMethod);
  const procedures = asArray(record.procedures).map(normalizeProcedure);
  const finalAmount = centsToCurrency(record.final_amount);
  const feesAmount = sum(paymentMethods.map((item) => item.feesAmount));
  const status = asString(record.status).toLowerCase();

  return {
    uuid: asString(record.uuid) || crypto.randomUUID(),
    type: asString(record.type),
    name: asString(record.name) || "Sem nome",
    saleDate: asNullableString(record.sale_date),
    dueDate: asNullableString(record.due_date),
    status,
    buyerName: normalizeNamedEntity(record.buyer).name || "Nao informado",
    sellerName: normalizeNamedEntity(record.seller).name || "Nao informado",
    nominalAmount: centsToCurrency(record.nominal_amount),
    discountAmount: centsToCurrency(record.discount_amount),
    additionAmount: centsToCurrency(record.addition_amount),
    finalAmount,
    feesAmount,
    netAmount: Math.max(0, finalAmount - feesAmount),
    isActive: status === "active" || status === "open" || status === "paid",
    paymentMethods,
    procedures,
    raw: record,
  };
}

export function normalizeBill(value: unknown): NormalizedBill {
  const record = asRecord(value);
  const paymentMethods = asArray(record.payment_methods).map(normalizePaymentMethod);
  const parcels = paymentMethods.flatMap((method) => method.parcels);

  return {
    uuid: asString(record.uuid) || crypto.randomUUID(),
    type: asString(record.type),
    description: asString(record.description) || "Sem descricao",
    amount: centsToCurrency(record.amount),
    nominalAmount: centsToCurrency(record.nominal_amount),
    discountAmount: centsToCurrency(record.discount_amount),
    feesAmount: centsToCurrency(record.fees_amount),
    finalAmount: centsToCurrency(record.final_amount),
    netAmount: centsToCurrency(record.net_amount),
    balance: centsToCurrency(record.balance),
    emissionDate: asNullableString(record.emission_date),
    categoryName: normalizeNamedEntity(record.category).name || "Nao informado",
    personName: normalizeNamedEntity(record.person).name || "Nao informado",
    paymentMethods,
    parcels,
    raw: record,
  };
}

export function normalizeParcel(value: unknown): NormalizedParcel {
  const record = asRecord(value);
  return {
    uuid: asString(record.uuid) || crypto.randomUUID(),
    type: asString(record.type).toLowerCase(),
    dueDate: asNullableString(record.due_date),
    executionDate: asNullableString(record.execution_date),
    compensationDate: asNullableString(record.compensation_date),
    calcCompensationDate: asNullableString(record.calc_compensation_date),
    status: asString(record.status).toLowerCase(),
    parcelNumber: asString(record.parcel_number),
    paymentMethodName:
      normalizeNamedEntity(record.payment_method).name || asString(asRecord(record.payment_method).description) || "Nao informado",
    financialAccountName:
      normalizeNamedEntity(record.financial_account).name || "Nao informado",
    amount: pickMoneyAmount(record),
    raw: record,
  };
}

export function classifyParcel(parcel: NormalizedParcel, now = new Date()) {
  const status = parcel.status.toLowerCase();
  const type = parcel.type.toLowerCase();
  const direction: Direction = type.includes("receiv")
    ? "receivable"
    : type.includes("pay")
      ? "payable"
      : "unknown";
  const isOpen = !["paid", "received", "compensated", "done", "closed"].includes(status);
  const dueDate = parcel.dueDate ? new Date(`${dateOnly(parcel.dueDate)}T00:00:00Z`) : null;
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const isOverdue = Boolean(dueDate && isOpen && dueDate < today);

  return {
    direction,
    isOpen,
    isOverdue,
  };
}

function accumulateByLabel(entries: Array<{ label: string; value: number }>): MetricRow[] {
  const map = new Map<string, number>();
  for (const entry of entries) {
    const label = entry.label || "Nao informado";
    map.set(label, (map.get(label) ?? 0) + entry.value);
  }

  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value);
}

function enumerateDates(startsAt: string, endsAt: string): string[] {
  const values: string[] = [];
  let cursor = new Date(`${startsAt}T00:00:00Z`);
  const end = new Date(`${endsAt}T00:00:00Z`);

  while (cursor <= end) {
    values.push(formatDate(cursor));
    cursor = addDays(cursor, 1);
  }

  return values;
}

export function computeDashboardAnalytics(
  data: DashboardData,
  range: DateRange,
  now = new Date()
): DashboardAnalytics {
  const parcelFacts = data.parcels.map((parcel) => ({
    parcel,
    classification: classifyParcel(parcel, now),
  }));
  const grossRevenue = sum(data.sales.map((sale) => sale.finalAmount));
  const salesCount = data.sales.length;
  const expenses = sum(data.bills.map((bill) => bill.finalAmount));
  const receivables = sum(
    parcelFacts
      .filter((item) => item.classification.direction === "receivable")
      .map((item) => item.parcel.amount)
  );
  const payables = sum(
    parcelFacts
      .filter((item) => item.classification.direction === "payable")
      .map((item) => item.parcel.amount)
  );
  const overdueParcels = parcelFacts.filter((item) => item.classification.isOverdue).length;
  const overdueReceivablesAmount = sum(
    parcelFacts
      .filter(
        (item) =>
          item.classification.isOverdue &&
          item.classification.direction === "receivable"
      )
      .map((item) => item.parcel.amount)
  );
  const activeSales = data.sales.filter((sale) => sale.isActive).length;
  const inactiveSales = salesCount - activeSales;
  const netRevenue = sum(data.sales.map((sale) => sale.netAmount));
  const openSales = data.sales.filter((sale) => !sale.isActive);
  const openSalesCount = openSales.length;
  const openSalesValue = sum(openSales.map((sale) => sale.finalAmount));
  const totalDiscounts = sum(data.sales.map((sale) => sale.discountAmount));
  const totalPaymentFees = sum(data.sales.map((sale) => sale.feesAmount));

  const seriesMap = new Map<string, DashboardSeriesPoint>();
  for (const date of enumerateDates(range.startsAt, range.endsAt)) {
    seriesMap.set(date, { date, sales: 0, expenses: 0, balance: 0, receivables: 0 });
  }

  for (const sale of data.sales) {
    const key = dateOnly(sale.saleDate);
    if (key && seriesMap.has(key)) {
      seriesMap.get(key)!.sales += sale.finalAmount;
    }
  }

  for (const bill of data.bills) {
    const key = dateOnly(bill.emissionDate);
    if (key && seriesMap.has(key)) {
      seriesMap.get(key)!.expenses += bill.finalAmount;
    }
  }

  for (const item of parcelFacts) {
    const key = dateOnly(item.parcel.dueDate);
    if (key && seriesMap.has(key) && item.classification.direction === "receivable") {
      seriesMap.get(key)!.receivables += item.parcel.amount;
    }
  }

  const series = [...seriesMap.values()].map((entry) => ({
    ...entry,
    balance: entry.sales - entry.expenses,
  }));

  return {
    range,
    overview: {
      grossRevenue,
      netRevenue,
      salesCount,
      averageTicket: salesCount ? grossRevenue / salesCount : 0,
      expenses,
      operatingBalance: grossRevenue - expenses,
      receivables,
      payables,
      overdueParcels,
      overdueReceivablesAmount,
      activeSalesRate: salesCount ? activeSales / salesCount : 0,
      inactiveSalesRate: salesCount ? inactiveSales / salesCount : 0,
      totalNetRevenue: netRevenue,
      totalDiscounts,
      totalPaymentFees,
      openSalesCount,
      openSalesValue,
      discountRate: grossRevenue ? totalDiscounts / grossRevenue : 0,
    },
    series,
    sales: {
      bySeller: accumulateByLabel(data.sales.map((sale) => ({ label: sale.sellerName, value: sale.finalAmount }))),
      byPaymentMethod: accumulateByLabel(
        data.sales.flatMap((sale) =>
          sale.paymentMethods.map((method) => ({ label: method.name, value: method.amount || sale.finalAmount }))
        )
      ),
      byProcedure: accumulateByLabel(
        data.sales.flatMap((sale) =>
          sale.procedures.map((procedure) => ({ label: procedure.name, value: sale.finalAmount }))
        )
      ),
      topBuyers: accumulateByLabel(data.sales.map((sale) => ({ label: sale.buyerName, value: sale.finalAmount }))),
      byStatus: accumulateByLabel(data.sales.map((sale) => ({ label: sale.status, value: 1 }))),
      byPaymentProfile: [
        {
          label: "Parceladas",
          value: data.sales.filter((sale) => sale.paymentMethods.some((method) => method.parcels.length > 1)).length,
        },
        {
          label: "A vista",
          value: data.sales.filter((sale) => sale.paymentMethods.every((method) => method.parcels.length <= 1)).length,
        },
      ],
      table: data.sales,
    },
    bills: {
      byCategory: accumulateByLabel(data.bills.map((bill) => ({ label: bill.categoryName, value: bill.finalAmount }))),
      byType: accumulateByLabel(data.bills.map((bill) => ({ label: bill.type, value: bill.finalAmount }))),
      byPerson: accumulateByLabel(data.bills.map((bill) => ({ label: bill.personName, value: bill.finalAmount }))),
      topBills: accumulateByLabel(data.bills.map((bill) => ({ label: bill.description, value: bill.finalAmount }))),
      table: data.bills,
    },
    parcels: {
      byStatus: accumulateByLabel(data.parcels.map((parcel) => ({ label: parcel.status, value: 1 }))),
      byDirection: accumulateByLabel(
        parcelFacts.map((item) => ({ label: item.classification.direction, value: item.parcel.amount }))
      ),
      byFinancialAccount: accumulateByLabel(
        data.parcels.map((parcel) => ({ label: parcel.financialAccountName, value: parcel.amount }))
      ),
      byPaymentMethod: accumulateByLabel(
        data.parcels.map((parcel) => ({ label: parcel.paymentMethodName, value: parcel.amount }))
      ),
      overdue: parcelFacts.filter((item) => item.classification.isOverdue).map((item) => item.parcel),
      table: data.parcels,
    },
  };
}
