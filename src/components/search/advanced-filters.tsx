"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { JobFilters } from "@/lib/search/filters";

interface AdvancedFiltersProps {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
  onApply: () => void;
}

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
];

const EXPERIENCE_LEVELS = [
  { value: "ENTRY", label: "Entry Level" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "SENIOR", label: "Senior" },
  { value: "EXECUTIVE", label: "Executive" },
];

const POPULAR_SKILLS = [
  "React",
  "Node.js",
  "Python",
  "TypeScript",
  "JavaScript",
  "AWS",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "MongoDB",
  "Machine Learning",
  "Data Analysis",
  "UI/UX Design",
];

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

export function AdvancedFilters({
  filters,
  onChange,
  onApply,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<JobFilters>(filters);

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onChange(localFilters);
    onApply();
  };

  const handleReset = () => {
    const resetFilters: JobFilters = {};
    setLocalFilters(resetFilters);
    onChange(resetFilters);
    onApply();
  };

  const activeFilterCount = Object.keys(localFilters).filter(
    (key) =>
      key !== "query" &&
      key !== "sortBy" &&
      localFilters[key as keyof JobFilters]
  ).length;

  if (!isExpanded) {
    return (
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(true)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Advanced Filters</CardTitle>
            <CardDescription>Refine your job search</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Job Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {JOB_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`jobType-${type.value}`}
                  checked={localFilters.jobType?.includes(type.value)}
                  onCheckedChange={(checked) => {
                    const current = localFilters.jobType || [];
                    handleFilterChange(
                      "jobType",
                      checked
                        ? [...current, type.value]
                        : current.filter((t) => t !== type.value)
                    );
                  }}
                />
                <Label
                  htmlFor={`jobType-${type.value}`}
                  className="font-normal cursor-pointer"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Experience Level</Label>
          <div className="grid grid-cols-2 gap-3">
            {EXPERIENCE_LEVELS.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`exp-${level.value}`}
                  checked={localFilters.experienceLevel?.includes(level.value)}
                  onCheckedChange={(checked) => {
                    const current = localFilters.experienceLevel || [];
                    handleFilterChange(
                      "experienceLevel",
                      checked
                        ? [...current, level.value]
                        : current.filter((e) => e !== level.value)
                    );
                  }}
                />
                <Label
                  htmlFor={`exp-${level.value}`}
                  className="font-normal cursor-pointer"
                >
                  {level.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Salary Range (Annual)</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-xs text-gray-500">Minimum</Label>
                <div className="mt-1 text-sm font-medium">
                  ${(localFilters.salaryMin || 0).toLocaleString()}
                </div>
              </div>
              <div className="flex-1">
                <Label className="text-xs text-gray-500">Maximum</Label>
                <div className="mt-1 text-sm font-medium">
                  ${(localFilters.salaryMax || 200000).toLocaleString()}
                </div>
              </div>
            </div>
            <Slider
              min={0}
              max={200000}
              step={5000}
              value={[
                localFilters.salaryMin || 0,
                localFilters.salaryMax || 200000,
              ]}
              onValueChange={([min, max]) => {
                handleFilterChange("salaryMin", min);
                handleFilterChange("salaryMax", max);
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Skills</Label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.map((skill) => {
              const isSelected = localFilters.skills?.includes(skill);
              return (
                <Badge
                  key={skill}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    const current = localFilters.skills || [];
                    handleFilterChange(
                      "skills",
                      isSelected
                        ? current.filter((s) => s !== skill)
                        : [...current, skill]
                    );
                  }}
                >
                  {skill}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Company Size</Label>
          <Select
            value={localFilters.companySize?.[0]}
            onValueChange={(value) =>
              handleFilterChange("companySize", [value])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any size</SelectItem>
              {COMPANY_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
