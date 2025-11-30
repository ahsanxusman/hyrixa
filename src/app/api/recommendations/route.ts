import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  cosineSimilarity,
  calculateMatchScore,
} from "@/lib/matching/similarity";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CANDIDATE") {
      return NextResponse.json(
        { error: "Only candidates can get recommendations" },
        { status: 403 }
      );
    }

    // Get user's profile embedding
    const profileEmbeddingResult = await prisma.$queryRaw<
      Array<{ cvEmbedding: string }>
    >`
      SELECT "cvEmbedding"::text
      FROM "Profile"
      WHERE "userId" = ${session.user.id}
    `;

    if (!profileEmbeddingResult[0]?.cvEmbedding) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        message:
          "Please generate your profile embedding to get personalized recommendations",
      });
    }

    const profileEmbedding = JSON.parse(profileEmbeddingResult[0].cvEmbedding);

    // Get user's recent search history to understand preferences
    const recentSearches = await prisma.searchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Extract preferences from search history
    const searchedSkills = new Set<string>();
    const searchedLocations = new Set<string>();
    const searchedJobTypes = new Set<string>();

    recentSearches.forEach((search) => {
      if (search.filters) {
        const filters = search.filters as any;
        if (filters.skills) {
          filters.skills.forEach((skill: string) => searchedSkills.add(skill));
        }
        if (filters.location) {
          searchedLocations.add(filters.location);
        }
        if (filters.jobType) {
          filters.jobType.forEach((type: string) => searchedJobTypes.add(type));
        }
      }
    });

    // Build preference-based filters
    const preferenceFilters: any = {
      status: "ACTIVE",
      jobEmbedding: { not: null },
    };

    if (searchedLocations.size > 0) {
      preferenceFilters.OR = Array.from(searchedLocations).map((loc) => ({
        location: { contains: loc, mode: "insensitive" },
      }));
    }

    // Get jobs with embeddings
    const jobsWithEmbeddings = await prisma.$queryRaw<
      Array<{ id: string; jobEmbedding: string }>
    >`
      SELECT "id", "jobEmbedding"::text
      FROM "Job"
      WHERE "status" = 'ACTIVE' AND "jobEmbedding" IS NOT NULL
      ORDER BY "createdAt" DESC
      LIMIT 100
    `;

    // Calculate match scores
    const matches = jobsWithEmbeddings.map((job) => {
      const jobEmbedding = JSON.parse(job.jobEmbedding);
      const similarity = cosineSimilarity(profileEmbedding, jobEmbedding);
      const matchScore = calculateMatchScore(similarity);

      return {
        jobId: job.id,
        matchScore,
        similarity,
      };
    });

    // Sort by match score and get top recommendations
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Get top 12 recommendations (excluding very low matches)
    const topMatches = matches.filter((m) => m.matchScore >= 50).slice(0, 12);

    // Fetch job details
    const jobIds = topMatches.map((m) => m.jobId);

    const jobs = await prisma.job.findMany({
      where: {
        id: { in: jobIds },
      },
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

    // Combine with match scores
    const recommendations = topMatches.map((match) => {
      const job = jobs.find((j) => j.id === match.jobId);
      return {
        ...job,
        matchScore: match.matchScore,
      };
    });

    return NextResponse.json({
      success: true,
      recommendations,
      total: recommendations.length,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
