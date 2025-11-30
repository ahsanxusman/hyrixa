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
        { error: "Only candidates can view job matches" },
        { status: 403 }
      );
    }

    // Get candidate profile with embedding
    const profileEmbeddingResult = await prisma.$queryRaw<
      Array<{ cvEmbedding: string }>
    >`
      SELECT "cvEmbedding"::text
      FROM "Profile"
      WHERE "userId" = ${session.user.id}
    `;

    if (!profileEmbeddingResult[0]?.cvEmbedding) {
      return NextResponse.json(
        { error: "Profile embedding not generated. Please generate it first." },
        { status: 400 }
      );
    }

    const profileEmbedding = JSON.parse(profileEmbeddingResult[0].cvEmbedding);

    // Get all active jobs with embeddings
    const jobsWithEmbeddings = await prisma.$queryRaw<
      Array<{
        id: string;
        jobEmbedding: string;
      }>
    >`
      SELECT "id", "jobEmbedding"::text
      FROM "Job"
      WHERE "status" = 'ACTIVE' AND "jobEmbedding" IS NOT NULL
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

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Get top 50 matches
    const topMatches = matches.slice(0, 50);

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

    // Combine match scores with job data
    const rankedJobs = topMatches.map((match) => {
      const job = jobs.find((j) => j.id === match.jobId);
      return {
        ...job,
        matchScore: match.matchScore,
      };
    });

    return NextResponse.json({
      success: true,
      matches: rankedJobs,
      total: rankedJobs.length,
    });
  } catch (error) {
    console.error("Job matching error:", error);
    return NextResponse.json(
      { error: "Failed to match jobs" },
      { status: 500 }
    );
  }
}
