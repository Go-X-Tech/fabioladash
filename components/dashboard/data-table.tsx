"use client";

import { formatCurrency, formatDate } from "./format";

export type TableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T extends { uuid: string }> = {
  rows: T[];
  columns: TableColumn<T>[];
  emptyLabel: string;
  onRowClick: (row: T) => void;
};

export function currencyCell(value: number) {
  return <span className="font-medium text-zinc-950">{formatCurrency(value)}</span>;
}

export function dateCell(value: string | null | undefined) {
  return <span>{formatDate(value)}</span>;
}

export default function DataTable<T extends { uuid: string }>({
  rows,
  columns,
  emptyLabel,
  onRowClick,
}: Props<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 ${column.className ?? ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.length ? (
              rows.map((row) => (
                <tr
                  key={row.uuid}
                  className="cursor-pointer transition hover:bg-zinc-50"
                  onClick={() => onRowClick(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`whitespace-nowrap px-4 py-3 text-zinc-600 ${column.className ?? ""}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-zinc-500"
                >
                  {emptyLabel}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
