"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, MapPin, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    location: string;
    jobType: string;
  };
  candidate?: {
    name: string;
    email: string;
    profile: {
      skills: string[];
      experienceLevel: string;
    };
  };
  company: {
    name: string;
    profile: {
      companyName: string;
    };
  };
}

const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-800",
  REVIEWING: "bg-yellow-100 text-yellow-800",
  INTERVIEWING: "bg-purple-100 text-purple-800",
  OFFERED: "bg-green-100 text-green-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
};

export default function ApplicationsList() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications");
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, newStatus: string) => {
    try {
      await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const filteredApplications =
    filter === "all"
      ? applications
      : applications.filter((app) => app.status === filter);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="APPLIED">Applied</SelectItem>
            <SelectItem value="REVIEWING">Reviewing</SelectItem>
            <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
            <SelectItem value="OFFERED">Offered</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-gray-600">
          {filteredApplications.length} application(s)
        </span>
      </div>

      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No applications found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {session?.user?.role === "CANDIDATE"
                ? "Start applying to jobs to see them here"
                : "Applications from candidates will appear here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredApplications.map((application) => (
          <Card
            key={application.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">
                      {application.job.title}
                    </CardTitle>
                    <Badge className={STATUS_COLORS[application.status]}>
                      {application.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4 text-base">
                    {session?.user?.role === "CANDIDATE" ? (
                      <>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {application.company.profile?.companyName ||
                            application.company.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {application.job.location}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1">
                          Candidate: {application.candidate?.name}
                        </span>
                        <span>
                          {application.candidate?.profile.experienceLevel}
                        </span>
                      </>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Applied{" "}
                  {formatDistanceToNow(new Date(application.appliedAt), {
                    addSuffix: true,
                  })}
                </span>

                <div className="flex gap-2">
                  {session?.user?.role === "COMPANY" && (
                    <Select
                      value={application.status}
                      onValueChange={(value) =>
                        updateStatus(application.id, value)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                        <SelectItem value="REVIEWING">Reviewing</SelectItem>
                        <SelectItem value="INTERVIEWING">
                          Interviewing
                        </SelectItem>
                        <SelectItem value="OFFERED">Offered</SelectItem>
                        <SelectItem value="ACCEPTED">Accepted</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <Link href={`/dashboard/applications/${application.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
