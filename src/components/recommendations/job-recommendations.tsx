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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, MapPin, Building2 } from "lucide-react";
import { MatchScoreBadge } from "@/components/matching/match-score-badge";

interface JobRecommendation {
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

export function JobRecommendations() {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/recommendations");
      const data = await response.json();

      if (response.ok) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.error || "Failed to fetch recommendations");
      }
    } catch (err) {
      setError("Failed to fetch recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Recommended Jobs
          </CardTitle>
          <CardDescription>
            Complete your profile to get personalized job recommendations
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-linear-to-r from-blue-50 to-purple-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Jobs You Might Like</h3>
            <p className="text-sm text-blue-700 mt-1">
              Based on your profile and search history, we found{" "}
              {recommendations.length} personalized recommendations
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.slice(0, 6).map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-1">
                    {job.title}
                  </CardTitle>
                  <MatchScoreBadge score={job.matchScore} />
                </div>
                <CardDescription className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span className="line-clamp-1">
                      {job.company.profile?.companyName || job.company.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{job.location}</span>
                  </div>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700 line-clamp-2">
                {job.description}
              </p>

              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {job.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {job.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{job.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <Link href={`/jobs/${job.id}`}>
                <Button size="sm" className="w-full">
                  View Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length > 6 && (
        <div className="text-center">
          <Link href="/dashboard/matches">
            <Button variant="outline">
              View All {recommendations.length} Recommendations
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
