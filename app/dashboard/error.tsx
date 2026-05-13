"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-lg rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">
          Erro no dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950">
          Nao foi possivel carregar a tela
        </h1>
        <p className="mt-3 text-sm text-zinc-600">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
