import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  cosineSimilarity,
  calculateMatchScore,
} from "@/lib/matching/similarity";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "COMPANY") {
      return NextResponse.json(
        { error: "Only companies can view candidate matches" },
        { status: 403 }
      );
    }

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Get job with embedding
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.companyId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get job embedding
    const jobEmbeddingResult = await prisma.$queryRaw<
      Array<{ jobEmbedding: string }>
    >`
      SELECT "jobEmbedding"::text
      FROM "Job"
      WHERE "id" = ${jobId}
    `;

    if (!jobEmbeddingResult[0]?.jobEmbedding) {
      return NextResponse.json(
        { error: "Job embedding not generated. Please generate it first." },
        { status: 400 }
      );
    }

    const jobEmbedding = JSON.parse(jobEmbeddingResult[0].jobEmbedding);

    // Get all candidates with embeddings
    const candidatesWithEmbeddings = await prisma.$queryRaw<
      Array<{
        userId: string;
        cvEmbedding: string;
      }>
    >`
    SELECT "userId", "cvEmbedding"::text
    FROM "Profile"
    WHERE "cvEmbedding" IS NOT NULL
    `;

    // Calculate match scores
    const matches = candidatesWithEmbeddings.map((candidate) => {
      const candidateEmbedding = JSON.parse(candidate.cvEmbedding);
      const similarity = cosineSimilarity(jobEmbedding, candidateEmbedding);
      const matchScore = calculateMatchScore(similarity);

      return {
        userId: candidate.userId,
        matchScore,
        similarity,
      };
    });

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Get top 50 matches
    const topMatches = matches.slice(0, 50);

    // Fetch candidate details
    const candidateIds = topMatches.map((m) => m.userId);

    const candidates = await prisma.user.findMany({
      where: {
        id: { in: candidateIds },
      },
      include: {
        profile: true,
      },
    });

    // Combine match scores with candidate data
    const rankedCandidates = topMatches.map((match) => {
      const candidate = candidates.find((c) => c.id === match.userId);
      return {
        id: candidate?.id,
        name: candidate?.name,
        email: candidate?.email,
        profile: {
          bio: candidate?.profile?.bio,
          location: candidate?.profile?.location,
          skills: candidate?.profile?.skills,
          yearsOfExperience: candidate?.profile?.yearsOfExperience,
          experienceLevel: candidate?.profile?.experienceLevel,
          cvUrl: candidate?.profile?.cvUrl,
        },
        matchScore: match.matchScore,
      };
    });

    return NextResponse.json({
      success: true,
      matches: rankedCandidates,
      total: rankedCandidates.length,
    });
  } catch (error) {
    console.error("Candidate matching error:", error);
    return NextResponse.json(
      { error: "Failed to match candidates" },
      { status: 500 }
    );
  }
}
