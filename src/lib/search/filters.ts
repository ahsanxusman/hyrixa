import { Prisma } from "@prisma/client";

export interface JobFilters {
  query?: string;
  location?: string;
  jobType?: string[];
  experienceLevel?: string[];
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  companySize?: string[];
  industry?: string[];
  sortBy?: "relevance" | "recent" | "salary";
}

export interface EnhancedSearchQuery {
  original_query: string;
  extracted_keywords: string[];
  job_titles: string[];
  skills: string[];
  locations: string[];
  experience_level: string | null;
  job_type: string | null;
  salary_range: {
    min: number;
    max: number;
  } | null;
}

export function buildWhereClause(filters: JobFilters) {
  const where: any = {
    status: "ACTIVE",
  };

  if (filters.location) {
    where.location = {
      contains: filters.location,
      mode: "insensitive",
    };
  }

  if (filters.jobType && filters.jobType.length > 0) {
    where.jobType = {
      in: filters.jobType,
    };
  }

  if (filters.experienceLevel && filters.experienceLevel.length > 0) {
    where.experienceLevel = {
      in: filters.experienceLevel,
    };
  }

  if (filters.salaryMin !== undefined) {
    where.salaryMax = {
      gte: filters.salaryMin,
    };
  }

  if (filters.salaryMax !== undefined) {
    where.salaryMin = {
      lte: filters.salaryMax,
    };
  }

  if (filters.skills && filters.skills.length > 0) {
    where.skills = {
      hasSome: filters.skills,
    };
  }

  return where;
}

export function getOrderByClause(sortBy: JobFilters["sortBy"]) {
  switch (sortBy) {
    case "recent":
      return { createdAt: Prisma.SortOrder.desc };
    case "salary":
      return { salaryMax: Prisma.SortOrder.desc };
    case "relevance":
    default:
      return { createdAt: Prisma.SortOrder.desc };
  }
}
