import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ApplicationsList from "@/components/applications/applications-list";

export default async function ApplicationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {session.user.role === "CANDIDATE"
              ? "My Applications"
              : "Received Applications"}
          </h1>
          <p className="mt-2 text-gray-600">
            {session.user.role === "CANDIDATE"
              ? "Track your job applications"
              : "Manage candidate applications"}
          </p>
        </div>

        <ApplicationsList />
      </div>
    </div>
  );
}
