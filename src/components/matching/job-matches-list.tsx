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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  Briefcase,
  MapPin,
  Building2,
  Sparkles,
} from "lucide-react";
import { MatchScoreBadge } from "./match-score-badge";
import { GenerateEmbeddingButton } from "./generate-embedding-button";
import { MatchExplanation } from "./match-explanation";
import { SaveJobButton } from "../saved-jobs/save-job-button";

interface JobMatch {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  skills: string[];
  matchScore: number;
  company: {
    name: string;
    profile: {
      companyName: string;
      location: string;
      industry: string;
    };
  };
}

export default function JobMatchesList() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsEmbedding, setNeedsEmbedding] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/matching/jobs");
      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.error.includes("embedding not generated")
        ) {
          setNeedsEmbedding(true);
          return;
        }
        throw new Error(data.error || "Failed to fetch matches");
      }

      setMatches(data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch matches");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (needsEmbedding) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generate Your AI Profile</CardTitle>
          <CardDescription>
            Generate your AI profile to get personalized job matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateEmbeddingButton type="profile" onSuccess={fetchMatches} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No matches found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try updating your profile or check back later for new opportunities
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">AI-Powered Matching</h3>
            <p className="text-sm text-blue-700 mt-1">
              Found {matches.length} jobs ranked by compatibility with your
              profile
            </p>
          </div>
        </div>
      </div>

      {matches.map((job) => (
        <Card key={job.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <MatchScoreBadge score={job.matchScore} />
                </div>
                <CardDescription className="flex items-center gap-4 text-base">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {job.company.profile?.companyName || job.company.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 line-clamp-2">{job.description}</p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{job.jobType.replace("_", " ")}</Badge>
              <Badge variant="outline">{job.experienceLevel}</Badge>
              {job.company.profile?.industry && (
                <Badge variant="outline">{job.company.profile.industry}</Badge>
              )}
            </div>

            {job.skills && job.skills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Required Skills:
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.slice(0, 6).map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {job.skills.length > 6 && (
                    <Badge variant="secondary">
                      +{job.skills.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <MatchExplanation jobId={job.id} matchScore={job.matchScore} />

            <div className="flex gap-3 pt-2">
              <Link href={`/jobs/${job.id}`} className="flex-1">
                <Button className="w-full">View Details</Button>
              </Link>
              <SaveJobButton jobId={job.id} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
