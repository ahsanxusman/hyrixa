"use client";

import { useEffect, useState } from "react";
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
import { Loader2, Bookmark, MapPin, Building2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SavedJob {
  id: string;
  notes: string | null;
  createdAt: string;
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    jobType: string;
    skills: string[];
    company: {
      name: string;
      profile: {
        companyName: string;
      };
    };
  };
}

export default function SavedJobsList() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch("/api/saved-jobs");
      const data = await response.json();

      if (response.ok) {
        setSavedJobs(data.savedJobs);
      }
    } catch (error) {
      console.error("Failed to fetch saved jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (jobId: string) => {
    try {
      await fetch(`/api/saved-jobs?jobId=${jobId}`, {
        method: "DELETE",
      });

      setSavedJobs(savedJobs.filter((sj) => sj.job.id !== jobId));
    } catch (error) {
      console.error("Failed to unsave job:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bookmark className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No saved jobs yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Save jobs you're interested in to review them later
          </p>
          <Link href="/jobs/search">
            <Button className="mt-4">Browse Jobs</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {savedJobs.map((savedJob) => (
        <Card key={savedJob.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl">{savedJob.job.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-base mt-2">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {savedJob.job.company.profile?.companyName ||
                      savedJob.job.company.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {savedJob.job.location}
                  </span>
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnsave(savedJob.job.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 line-clamp-2">
              {savedJob.job.description}
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {savedJob.job.jobType.replace("_", " ")}
              </Badge>
              {savedJob.job.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-500">
                Saved{" "}
                {formatDistanceToNow(new Date(savedJob.createdAt), {
                  addSuffix: true,
                })}
              </span>

              <Link href={`/jobs/${savedJob.job.id}`}>
                <Button>View Job</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
