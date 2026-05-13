export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="h-28 animate-pulse rounded-lg bg-zinc-200" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-lg bg-zinc-200" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-96 animate-pulse rounded-lg bg-zinc-200" />
      </div>
    </div>
  );
}
