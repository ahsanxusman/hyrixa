import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BulkJobUpload from "@/components/jobs/bulk-job-upload";

export default async function BulkUploadPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Bulk Job Upload</h1>
          <p className="mt-2 text-gray-600">
            Upload multiple jobs at once using CSV or JSON
          </p>
        </div>

        <BulkJobUpload />
      </div>
    </div>
  );
}
