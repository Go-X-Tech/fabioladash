"use client";

import type {
  NormalizedBill,
  NormalizedParcel,
  NormalizedSale,
} from "../../lib/dashboard/index.ts";
import { formatCurrency, formatDate, formatStatus } from "./format";

type Props = {
  open: boolean;
  tab: "sales" | "bills" | "parcels";
  item: NormalizedSale | NormalizedBill | NormalizedParcel | null;
  onClose: () => void;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </dt>
      <dd className="text-sm font-medium text-zinc-900">{value || "-"}</dd>
    </div>
  );
}

export default function DetailDrawer({ open, tab, item, onClose }: Props) {
  const sale = tab === "sales" ? (item as NormalizedSale | null) : null;
  const bill = tab === "bills" ? (item as NormalizedBill | null) : null;
  const parcel = tab === "parcels" ? (item as NormalizedParcel | null) : null;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl transform border-l border-rose-100 bg-[linear-gradient(180deg,#fffdfd_0%,#fff7fb_100%)] shadow-2xl transition duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between border-b border-rose-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Detalhe
            </p>
            <h3 className="mt-1 font-serif text-[1.35rem] font-semibold text-[#412433]">
              {tab === "sales"
                ? "Venda"
                : tab === "bills"
                  ? "Despesa"
                  : "Parcela"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
          >
            Fechar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!item ? (
            <p className="text-sm text-zinc-500">Selecione uma linha para abrir o detalhe.</p>
          ) : sale ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field label="UUID" value={sale.uuid} />
              <Field label="Situação" value={formatStatus(sale.status)} />
              <Field label="Nome" value={sale.name} />
              <Field label="Data" value={formatDate(sale.saleDate)} />
              <Field label="Comprador" value={sale.buyerName} />
              <Field label="Vendedor" value={sale.sellerName} />
              <Field label="Valor nominal" value={formatCurrency(sale.nominalAmount)} />
              <Field label="Valor final" value={formatCurrency(sale.finalAmount)} />
              <Field label="Desconto" value={formatCurrency(sale.discountAmount)} />
              <Field label="Taxas" value={formatCurrency(sale.feesAmount)} />
              <Field label="Valor liquido" value={formatCurrency(sale.netAmount)} />
              <Field
                label="Procedimentos"
                value={sale.procedures.map((entry) => entry.name).join(", ") || "-"}
              />
              <Field
                label="Pagamentos"
                value={
                  sale.paymentMethods.map((entry) => entry.name).join(", ") || "Nao informado"
                }
              />
            </dl>
          ) : bill ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field label="UUID" value={bill.uuid} />
              <Field label="Tipo" value={bill.type} />
              <Field label="Descricao" value={bill.description} />
              <Field label="Pessoa" value={bill.personName} />
              <Field label="Categoria" value={bill.categoryName} />
              <Field label="Emissao" value={formatDate(bill.emissionDate)} />
              <Field label="Valor final" value={formatCurrency(bill.finalAmount)} />
              <Field label="Saldo" value={formatCurrency(bill.balance)} />
              <Field
                label="Parcelas vinculadas"
                value={bill.parcels.map((entry) => entry.uuid).join(", ") || "-"}
              />
            </dl>
          ) : parcel ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field label="UUID" value={parcel.uuid} />
              <Field label="Situação" value={formatStatus(parcel.status)} />
              <Field label="Vencimento" value={formatDate(parcel.dueDate)} />
              <Field label="Execucao" value={formatDate(parcel.executionDate)} />
              <Field label="Compensacao" value={formatDate(parcel.compensationDate)} />
              <Field label="Conta financeira" value={parcel.financialAccountName} />
              <Field label="Metodo" value={parcel.paymentMethodName} />
              <Field label="Parcela" value={parcel.parcelNumber || "-"} />
              <Field label="Valor" value={formatCurrency(parcel.amount)} />
            </dl>
          ) : null
          }
        </div>
      </div>
    </div>
  );
}
