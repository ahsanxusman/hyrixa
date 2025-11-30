import { auth } from "@/auth";
import { redirect } from "next/navigation";
import JobMatchesList from "@/components/matching/job-matches-list";

export default async function MatchesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role !== "CANDIDATE") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Job Matches</h1>
          <p className="mt-2 text-gray-600">
            AI-powered job recommendations based on your profile
          </p>
        </div>

        <JobMatchesList />
      </div>
    </div>
  );
}
