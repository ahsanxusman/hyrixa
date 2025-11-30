import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JobRecommendations } from "@/components/recommendations/job-recommendations";
import Link from "next/link";
import { Sparkles, User, Briefcase, Search } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {session.user.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your job search
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Link href="/dashboard/profile">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {session.user.role === "CANDIDATE" ? "Candidate" : "Company"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Manage your profile
                </p>
              </CardContent>
            </Card>
          </Link>

          {session.user.role === "CANDIDATE" && (
            <>
              <Link href="/dashboard/matches">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      AI Matches
                    </CardTitle>
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">View Matches</div>
                    <p className="text-xs text-muted-foreground">
                      AI-powered job recommendations
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/jobs/search">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Search Jobs
                    </CardTitle>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Discover</div>
                    <p className="text-xs text-muted-foreground">
                      Find your dream job
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {session.user.role === "COMPANY" && (
            <Link href="/dashboard/jobs">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Manage Jobs</div>
                  <p className="text-xs text-muted-foreground">
                    Post and manage listings
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        {session.user.role === "CANDIDATE" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
              <JobRecommendations />
            </div>
          </div>
        )}

        {session.user.role === "COMPANY" && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your hiring process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/jobs/new">
                <Button className="w-full">Post a New Job</Button>
              </Link>
              <Link href="/dashboard/jobs">
                <Button variant="outline" className="w-full">
                  View All Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
