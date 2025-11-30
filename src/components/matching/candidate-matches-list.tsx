"use client";

import { useEffect, useState } from "react";
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
  Users,
  MapPin,
  Briefcase,
  Sparkles,
  Download,
} from "lucide-react";
import { MatchScoreBadge } from "./match-score-badge";
import { GenerateEmbeddingButton } from "./generate-embedding-button";
import { MatchExplanation } from "./match-explanation";

interface CandidateMatch {
  id: string;
  name: string;
  email: string;
  matchScore: number;
  profile: {
    bio: string;
    location: string;
    skills: string[];
    yearsOfExperience: number;
    experienceLevel: string;
    cvUrl: string;
  };
}

interface CandidateMatchesListProps {
  jobId: string;
}

export default function CandidateMatchesList({
  jobId,
}: CandidateMatchesListProps) {
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsEmbedding, setNeedsEmbedding] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/matching/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

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
          <CardTitle>Generate Job AI Profile</CardTitle>
          <CardDescription>
            Generate an AI profile for this job to find matching candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateEmbeddingButton
            type="job"
            jobId={jobId}
            onSuccess={fetchMatches}
          />
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
          <Users className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No matches found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            No candidates match this job yet. Check back later as more
            candidates join.
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
              Found {matches.length} candidates ranked by compatibility with
              your job
            </p>
          </div>
        </div>
      </div>

      {matches.map((candidate) => (
        <Card key={candidate.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl">{candidate.name}</CardTitle>
                  <MatchScoreBadge score={candidate.matchScore} />
                </div>
                <CardDescription className="flex items-center gap-4 text-base">
                  {candidate.profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {candidate.profile.location}
                    </span>
                  )}
                  {candidate.profile?.experienceLevel && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {candidate.profile.experienceLevel} •{" "}
                      {candidate.profile.yearsOfExperience} years
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidate.profile?.bio && (
              <p className="text-gray-700 line-clamp-2">
                {candidate.profile.bio}
              </p>
            )}

            {candidate.profile?.skills &&
              candidate.profile.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Skills:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.profile.skills.slice(0, 8).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.profile.skills.length > 8 && (
                      <Badge variant="secondary">
                        +{candidate.profile.skills.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

            <MatchExplanation
              jobId={jobId}
              candidateId={candidate.id}
              matchScore={candidate.matchScore}
            />

            <div className="flex gap-3 pt-2">
              <Button variant="outline">Contact Candidate</Button>
              {candidate.profile?.cvUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(candidate.profile.cvUrl, "_blank")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  View CV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
