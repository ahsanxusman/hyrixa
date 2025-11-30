import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CandidateMatchesList from "@/components/matching/candidate-matches-list";

export default async function JobMatchesPage({
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
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Candidate Matches
          </h1>
          <p className="mt-2 text-gray-600">
            AI-powered candidate recommendations for:{" "}
            <strong>{job.title}</strong>
          </p>
        </div>

        <CandidateMatchesList jobId={jobId} />
      </div>
    </div>
  );
}
