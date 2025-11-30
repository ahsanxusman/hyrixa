import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";
import {
  User,
  Briefcase,
  Home,
  Sparkles,
  Bookmark,
  FileText,
  Shield,
} from "lucide-react";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { Badge } from "@/components/ui/badge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">Job Portal</h1>
              <nav className="flex gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="ghost" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </Link>
                {session.user.role === "COMPANY" && (
                  <>
                    <Link href="/dashboard/jobs">
                      <Button variant="ghost" size="sm">
                        <Briefcase className="mr-2 h-4 w-4" />
                        My Jobs
                      </Button>
                    </Link>
                    <Link href="/dashboard/applications">
                      <Button variant="ghost" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Applications
                      </Button>
                    </Link>
                  </>
                )}
                {session.user.role === "CANDIDATE" && (
                  <>
                    <Link href="/dashboard/matches">
                      <Button variant="ghost" size="sm">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Matches
                      </Button>
                    </Link>
                    <Link href="/dashboard/saved-jobs">
                      <Button variant="ghost" size="sm">
                        <Bookmark className="mr-2 h-4 w-4" />
                        Saved
                      </Button>
                    </Link>
                    <Link href="/dashboard/applications">
                      <Button variant="ghost" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Applications
                      </Button>
                    </Link>
                  </>
                )}
                {/* ADMIN LINK - CRITICAL */}
                {session.user.isAdmin && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <NotificationCenter />
              <span className="text-sm text-gray-600">
                {session.user.email}
              </span>
              {session.user.isAdmin && (
                <Badge variant="destructive">Admin</Badge>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
