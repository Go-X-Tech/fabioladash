import { redirect } from "next/navigation";
import DashboardScreen from "../../components/dashboard/dashboard-screen";
import { computeDashboardAnalytics } from "../../lib/dashboard/index.ts";
import { loadDashboardData } from "../../lib/dashboard/load-dashboard-data.ts";
import { isAuthenticated } from "../../lib/auth";
import { resolveDashboardDateRange } from "./lib";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const { range, preset } = resolveDashboardDateRange(resolvedSearchParams);
  const data = await loadDashboardData(range);
  const analytics = computeDashboardAnalytics(data, range);

  return (
    <DashboardScreen
      analytics={analytics}
      domainErrors={data.errors}
      preset={preset}
    />
  );
}
