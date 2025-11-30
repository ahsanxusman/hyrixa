import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { generateEmbedding } from "@/lib/openrouter";
import {
  cosineSimilarity,
  calculateMatchScore,
} from "@/lib/matching/similarity";
import {
  buildWhereClause,
  getOrderByClause,
  JobFilters,
} from "@/lib/search/filters";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const filters: JobFilters = body.filters || {};

    // Build base where clause
    const where = buildWhereClause(filters);

    // --- SEMANTIC SEARCH MODE ---
    if (filters.query && filters.query.trim().length > 0) {
      const queryEmbedding = await generateEmbedding(filters.query);

      const jobs = await prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              name: true,
              profile: {
                select: {
                  companyName: true,
                  location: true,
                  companySize: true,
                  industry: true,
                },
              },
            },
          },
        },
      });

      const jobIds = jobs.map((job) => job.id);

      if (jobIds.length === 0) {
        return NextResponse.json({
          success: true,
          jobs: [],
          total: 0,
        });
      }

      const jobEmbeddings = await prisma.$queryRaw<
        Array<{ id: string; jobEmbedding: string }>
      >`
        SELECT "id", "jobEmbedding"::text
        FROM "Job"
        WHERE "id" = ANY(${jobIds}::text[])
        AND "jobEmbedding" IS NOT NULL
      `;

      const jobsWithScores = jobEmbeddings
        .map((jobEmb) => {
          const embedding = JSON.parse(jobEmb.jobEmbedding);
          const similarity = cosineSimilarity(queryEmbedding, embedding);
          const matchScore = calculateMatchScore(similarity);
          const job = jobs.find((j) => j.id === jobEmb.id);

          return {
            ...job,
            matchScore,
            similarity,
          };
        })
        .filter((job) => job.matchScore >= 30)
        .sort((a, b) => b.matchScore - a.matchScore);

      // Save history (with FIX)
      if (session?.user?.id) {
        await prisma.searchHistory.create({
          data: {
            userId: session.user.id,
            query: filters.query,
            filters: filters as Prisma.InputJsonValue, // ← FIX 1
            resultCount: jobsWithScores.length,
          },
        });
      }

      return NextResponse.json({
        success: true,
        jobs: jobsWithScores.slice(0, 50),
        total: jobsWithScores.length,
      });
    }

    // --- NORMAL FILTERED SEARCH ---
    const orderBy = getOrderByClause(filters.sortBy);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              name: true,
              profile: {
                select: {
                  companyName: true,
                  location: true,
                  companySize: true,
                  industry: true,
                },
              },
            },
          },
        },
        orderBy,
        take: 50,
      }),
      prisma.job.count({ where }),
    ]);

    // Save history
    if (session?.user?.id && filters.query) {
      await prisma.searchHistory.create({
        data: {
          userId: session.user.id,
          query: filters.query,
          filters: filters as Prisma.InputJsonValue, // ← FIX 1 applied here too
          resultCount: total,
        },
      });
    }

    return NextResponse.json({
      success: true,
      jobs,
      total,
    });
  } catch (error) {
    console.error("Job search error:", error);
    return NextResponse.json(
      { error: "Failed to search jobs" },
      { status: 500 }
    );
  }
}
