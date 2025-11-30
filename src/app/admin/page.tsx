import { requireAdmin } from "@/lib/admin";
import AdminStats from "@/components/admin/admin-stats";
import AdminAnalytics from "@/components/admin/admin-analytics";
import RecentActivity from "@/components/admin/recent-activity";

export default async function AdminDashboardPage() {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">System overview and management</p>
        </div>

        <div className="space-y-8">
          <AdminStats />
          <AdminAnalytics />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
