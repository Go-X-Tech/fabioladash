export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

export const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

export const integerFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value || 0);
}

export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value || 0);
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value || 0);
}

export function formatInteger(value: number): string {
  return integerFormatter.format(value || 0);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatStatus(value: string | null | undefined): string {
  switch ((value || "").toLowerCase()) {
    case "active":
      return "Ativa";
    case "inactive":
      return "Inativa";
    case "open":
      return "Em aberto";
    case "paid":
      return "Paga";
    case "received":
      return "Recebida";
    case "compensated":
      return "Compensada";
    case "done":
      return "Concluída";
    case "closed":
      return "Fechada";
    case "canceled":
      return "Cancelada";
    default:
      return value || "-";
  }
}

export function formatDirection(value: string | null | undefined): string {
  switch ((value || "").toLowerCase()) {
    case "receivable":
      return "A receber";
    case "payable":
      return "A pagar";
    case "unknown":
      return "Não classificado";
    default:
      return value || "-";
  }
}

export function formatDomainName(value: string): string {
  switch (value) {
    case "sales":
      return "vendas";
    case "bills":
      return "despesas";
    case "parcels":
      return "parcelas";
    default:
      return value;
  }
}
