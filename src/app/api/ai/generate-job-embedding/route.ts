import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { generateEmbedding } from "@/lib/openrouter";
import { buildJobText } from "@/lib/matching/profile-builder";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "COMPANY") {
      return NextResponse.json(
        { error: "Only companies can generate job embeddings" },
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

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.companyId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build job text
    const jobText = buildJobText(job);

    // Generate embedding
    const embedding = await generateEmbedding(jobText);

    // Store embedding in database
    await prisma.$executeRaw`
      UPDATE "Job"
      SET "jobEmbedding" = ${JSON.stringify(embedding)}::vector,
          "embeddingUpdatedAt" = NOW()
      WHERE "id" = ${jobId}
    `;

    return NextResponse.json({
      success: true,
      message: "Job embedding generated successfully",
    });
  } catch (error) {
    console.error("Generate job embedding error:", error);
    return NextResponse.json(
      { error: "Failed to generate job embedding" },
      { status: 500 }
    );
  }
}
