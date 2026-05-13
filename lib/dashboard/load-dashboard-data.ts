import { apiFetch } from "../api.ts";
import type { DashboardData, DateRange } from "./index.ts";
import { normalizeBill, normalizeParcel, normalizeSale } from "./index.ts";

type Fetcher = (path: string, params?: Record<string, string>) => Promise<unknown>;
type DomainKey = "sales" | "bills" | "parcels";
type DomainErrors = Partial<Record<DomainKey, string>>;

type PageResult = {
  items: unknown[];
  hasNextPage: boolean;
};

function toApiDateTime(date: string, endOfDay: boolean): string {
  return `${date}T${endOfDay ? "23:59:59" : "00:00:00"}-03:00`;
}

function buildRangeParams(path: string, range: DateRange): Record<string, string> {
  const start = toApiDateTime(range.startsAt, false);
  const end = toApiDateTime(range.endsAt, true);

  if (path === "/bills" || path === "/parcels") {
    return {
      starts_at: start,
      ends_at: end,
      start_date: start,
      end_date: end,
    };
  }

  return {
    starts_at: start,
    ends_at: end,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function extractPage(response: unknown, page: number): PageResult {
  if (Array.isArray(response)) {
    return { items: response, hasNextPage: false };
  }

  const record = asRecord(response);
  const items = asArray(record.data ?? record.items ?? record.results);
  const meta = asRecord(record.meta);
  const currentPage = Number(meta.current_page ?? record.current_page ?? page);
  const lastPage = Number(meta.last_page ?? record.last_page ?? currentPage);
  const nextPageUrl = record.next_page_url ?? meta.next_page_url;

  return {
    items,
    hasNextPage: Boolean(nextPageUrl) || currentPage < lastPage,
  };
}

async function fetchAllPages(
  path: string,
  range: DateRange,
  fetcher: Fetcher
): Promise<unknown[]> {
  const items: unknown[] = [];

  for (let page = 1; page <= 100; page += 1) {
    const response = await fetcher(path, {
      ...buildRangeParams(path, range),
      page: String(page),
    });
    const current = extractPage(response, page);

    items.push(...current.items);

    if (!current.hasNextPage || current.items.length === 0) {
      break;
    }
  }

  return items;
}

async function fetchOptionalPages(path: string, fetcher: Fetcher): Promise<unknown[]> {
  try {
    const response = await fetcher(path, { page: "1" });
    return extractPage(response, 1).items;
  } catch {
    return [];
  }
}

async function fetchRequiredPages(
  path: string,
  range: DateRange,
  fetcher: Fetcher
): Promise<{ items: unknown[]; error?: string }> {
  try {
    const items = await fetchAllPages(path, range, fetcher);
    return { items };
  } catch (error) {
    return {
      items: [],
      error: error instanceof Error ? error.message : "Erro ao carregar dominio",
    };
  }
}

export async function loadDashboardData(
  range: DateRange,
  fetcher: Fetcher = (path, params) => apiFetch(path, params, { cache: "no-store" })
): Promise<DashboardData & { errors: DomainErrors }> {
  const [salesResult, billsResult, parcelsResult, patientsRaw, financialCategoriesRaw] =
    await Promise.all([
      fetchRequiredPages("/sales", range, fetcher),
      fetchRequiredPages("/bills", range, fetcher),
      fetchRequiredPages("/parcels", range, fetcher),
      fetchOptionalPages("/patients", fetcher),
      fetchOptionalPages("/financial-categories", fetcher),
    ]);

  return {
    sales: salesResult.items.map(normalizeSale),
    bills: billsResult.items.map(normalizeBill),
    parcels: parcelsResult.items.map(normalizeParcel),
    patients: patientsRaw.map((item) => asRecord(item)),
    financialCategories: financialCategoriesRaw.map((item) => asRecord(item)),
    errors: {
      ...(salesResult.error ? { sales: salesResult.error } : {}),
      ...(billsResult.error ? { bills: billsResult.error } : {}),
      ...(parcelsResult.error ? { parcels: parcelsResult.error } : {}),
    },
  };
}
