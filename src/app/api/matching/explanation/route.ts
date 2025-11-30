import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { generateMatchExplanation } from "@/lib/openrouter";
import {
  buildCandidateProfileText,
  buildJobText,
} from "@/lib/matching/profile-builder";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, candidateId, matchScore } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Get job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // For companies viewing candidate matches
    if (session.user.role === "COMPANY") {
      if (!candidateId) {
        return NextResponse.json(
          { error: "Candidate ID is required" },
          { status: 400 }
        );
      }

      if (job.companyId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const candidateProfile = await prisma.profile.findUnique({
        where: { userId: candidateId },
      });

      if (!candidateProfile) {
        return NextResponse.json(
          { error: "Candidate profile not found" },
          { status: 404 }
        );
      }

      const profileText = buildCandidateProfileText(candidateProfile);
      const jobText = buildJobText(job);

      const explanation = await generateMatchExplanation(
        profileText,
        jobText,
        matchScore
      );

      return NextResponse.json({ success: true, explanation });
    }

    // For candidates viewing job matches
    if (session.user.role === "CANDIDATE") {
      const candidateProfile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
      });

      if (!candidateProfile) {
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 }
        );
      }

      const profileText = buildCandidateProfileText(candidateProfile);
      const jobText = buildJobText(job);

      const explanation = await generateMatchExplanation(
        profileText,
        jobText,
        matchScore
      );

      return NextResponse.json({ success: true, explanation });
    }

    return NextResponse.json({ error: "Invalid user role" }, { status: 403 });
  } catch (error) {
    console.error("Match explanation error:", error);
    return NextResponse.json(
      { error: "Failed to generate match explanation" },
      { status: 500 }
    );
  }
}
