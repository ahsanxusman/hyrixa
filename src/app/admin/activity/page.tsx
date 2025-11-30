import { requireAdmin } from "@/lib/admin";
import UserManagement from "@/components/admin/user-management";

export default async function AdminUsersPage() {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="mt-2 text-gray-600">Manage all users in the system</p>
        </div>

        <UserManagement />
      </div>
    </div>
  );
}
