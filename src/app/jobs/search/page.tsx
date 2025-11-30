"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import {
  Loader2,
  Briefcase,
  MapPin,
  Building2,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { AdvancedFilters } from "@/components/search/advanced-filters";
import { RecentSearches } from "@/components/search/recent-searches";
import { MatchScoreBadge } from "@/components/matching/match-score-badge";
import { JobFilters } from "@/lib/search/filters";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  skills: string[];
  matchScore?: number;
  company: {
    name: string;
    profile: {
      companyName: string;
      location: string;
      industry: string;
    };
  };
}

export default function JobSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<JobFilters>({
    query: searchParams.get("q") || "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setFilters((prev) => ({ ...prev, query }));
      performSearch({ query });
    }
  }, [searchParams]);

  const performSearch = async (searchFilters: JobFilters = filters) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/search/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters: searchFilters }),
      });

      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, query };
    setFilters(newFilters);
    performSearch(newFilters);

    const params = new URLSearchParams();
    params.set("q", query);
    router.push(`/jobs/search?${params.toString()}`);
  };

  const handleFiltersApply = () => {
    performSearch(filters);
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="mb-4 text-3xl font-bold">Find Your Dream Job</h1>
          <SearchBar onSearch={handleSearch} defaultValue={filters.query} />
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-1">
            {showFilters && (
              <AdvancedFilters
                filters={filters}
                onChange={setFilters}
                onApply={handleFiltersApply}
              />
            )}
            <RecentSearches onSearchClick={handleSearch} />
          </div>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : jobs.length === 0 && filters.query ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No jobs found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Try adjusting your search or filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filters.query && jobs.length > 0 && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-900">
                          AI-Powered Results
                        </h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Found {jobs.length} jobs matching "{filters.query}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">
                              {job.title}
                            </CardTitle>
                            {job.matchScore && (
                              <MatchScoreBadge score={job.matchScore} />
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-4 text-base">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.company.profile?.companyName ||
                                job.company.name}
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
                      <p className="text-gray-700 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {job.jobType.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline">{job.experienceLevel}</Badge>
                        {job.company.profile?.industry && (
                          <Badge variant="outline">
                            {job.company.profile.industry}
                          </Badge>
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

                      <div className="flex gap-3 pt-2">
                        <Link href={`/jobs/${job.id}`} className="flex-1">
                          <Button className="w-full">View Details</Button>
                        </Link>
                        <Button variant="outline">Save</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
