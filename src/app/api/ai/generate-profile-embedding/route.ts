import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { generateEmbedding } from "@/lib/openrouter";
import { buildCandidateProfileText } from "@/lib/matching/profile-builder";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CANDIDATE") {
      return NextResponse.json(
        { error: "Only candidates can generate profile embeddings" },
        { status: 403 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Build profile text
    const profileText = buildCandidateProfileText(profile);

    if (profileText.length < 50) {
      return NextResponse.json(
        { error: "Profile is too incomplete to generate embedding" },
        { status: 400 }
      );
    }

    // Generate embedding
    const embedding = await generateEmbedding(profileText);

    // Store embedding in database
    await prisma.$executeRaw`
      UPDATE "Profile"
      SET "cvEmbedding" = ${JSON.stringify(embedding)}::vector,
          "embeddingUpdatedAt" = NOW()
      WHERE "userId" = ${session.user.id}
    `;

    return NextResponse.json({
      success: true,
      message: "Profile embedding generated successfully",
    });
  } catch (error) {
    console.error("Generate profile embedding error:", error);
    return NextResponse.json(
      { error: "Failed to generate profile embedding" },
      { status: 500 }
    );
  }
}
