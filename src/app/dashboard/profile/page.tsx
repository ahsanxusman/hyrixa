import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CandidateProfileForm from "@/components/profile/candidate-profile-form";
import CompanyProfileForm from "@/components/profile/company-profile-form";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {session.user.role === "CANDIDATE"
              ? "Your Profile"
              : "Company Profile"}
          </h1>
          <p className="mt-2 text-gray-600">
            {session.user.role === "CANDIDATE"
              ? "Build your professional profile to get matched with the best jobs"
              : "Complete your company profile to attract top talent"}
          </p>
        </div>

        {session.user.role === "CANDIDATE" ? (
          <CandidateProfileForm />
        ) : (
          <CompanyProfileForm />
        )}
      </div>
    </div>
  );
}
