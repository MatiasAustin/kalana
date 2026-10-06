import { getAnalyticsData } from "@/lib/actions/analytics";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics & Telemetry — KALANA Admin",
};

export default async function AnalyticsPage() {
  const initialData = await getAnalyticsData("30d");

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <AnalyticsDashboard initialData={initialData} />
    </div>
  );
}
