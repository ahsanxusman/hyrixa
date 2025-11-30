import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import JobForm from "@/components/jobs/job-form";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  const { jobId } = await params;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    notFound();
  }

  if (job.companyId !== session.user.id) {
    redirect("/dashboard/jobs");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
          <p className="mt-2 text-gray-600">Update your job posting details</p>
        </div>

        <JobForm job={JSON.parse(JSON.stringify(job))} isEditing />
      </div>
    </div>
  );
}
