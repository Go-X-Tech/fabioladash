"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  startsAt: string;
  endsAt: string;
  preset: string;
  label: string;
};

const PRESETS = [
  { key: "today", label: "Hoje" },
  { key: "7-days", label: "7 dias" },
  { key: "30-days", label: "30 dias" },
  { key: "current-month", label: "Mes atual" },
  { key: "previous-month", label: "Mes anterior" },
] as const;

export default function DashboardHeader({
  startsAt,
  endsAt,
  preset,
  label,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [customStartsAt, setCustomStartsAt] = useState(startsAt);
  const [customEndsAt, setCustomEndsAt] = useState(endsAt);

  const activePreset = useMemo(() => {
    return PRESETS.some((item) => item.key === preset) ? preset : "custom";
  }, [preset]);

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => params.set(key, value));
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="border-b border-rose-100 bg-[linear-gradient(180deg,#fff8fb_0%,#fffdfa_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
              Clínica Experts
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="font-serif text-[clamp(2.2rem,3.4vw,3.5rem)] font-semibold leading-[0.92] text-[#412433]">
                Panorama executivo da clínica
              </h1>
              <span className="text-sm text-zinc-500">{label}</span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
              Receita, vendas não fechadas, despesas e cobrança com leitura rápida para decisão da dona da clínica.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center justify-center rounded-md border border-rose-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-rose-300 hover:text-[#412433]"
          >
            Sair
          </button>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((item) => {
              const selected = activePreset === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    pushParams({
                      preset: item.key,
                      starts_at: "",
                      ends_at: "",
                    })
                  }
                  className={`inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium transition ${
                    selected
                      ? "border-rose-300 bg-rose-100 text-[#7a3658]"
                      : "border-rose-100 bg-white text-zinc-700 hover:border-rose-200 hover:text-[#412433]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <form
            className="grid grid-cols-1 gap-3 rounded-lg border border-rose-100 bg-white p-3 shadow-[0_12px_40px_-30px_rgba(190,24,93,0.35)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              pushParams({
                preset: "custom",
                starts_at: customStartsAt,
                ends_at: customEndsAt,
              });
            }}
          >
            <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Início
              <input
                type="date"
                value={customStartsAt}
                onChange={(event) => setCustomStartsAt(event.target.value)}
                className="h-10 rounded-md border border-rose-100 bg-[#fffafb] px-3 text-sm font-medium text-zinc-900 outline-none ring-0"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Fim
              <input
                type="date"
                value={customEndsAt}
                onChange={(event) => setCustomEndsAt(event.target.value)}
                className="h-10 rounded-md border border-rose-100 bg-[#fffafb] px-3 text-sm font-medium text-zinc-900 outline-none ring-0"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center self-end rounded-md bg-[#b85c85] px-4 text-sm font-medium text-white transition hover:bg-[#a14d74]"
            >
              Aplicar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
