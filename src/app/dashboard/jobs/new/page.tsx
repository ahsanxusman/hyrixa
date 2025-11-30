import { auth } from "@/auth";
import { redirect } from "next/navigation";
import JobForm from "@/components/jobs/job-form";

export default async function NewJobPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          <p className="mt-2 text-gray-600">
            Fill in the details to create a new job posting
          </p>
        </div>

        <JobForm />
      </div>
    </div>
  );
}
