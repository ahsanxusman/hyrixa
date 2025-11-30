import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications/service";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where =
      session.user.role === "CANDIDATE"
        ? { candidateId: session.user.id }
        : { companyId: session.user.id };

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            jobType: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                skills: true,
                experienceLevel: true,
                cvUrl: true,
              },
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                companyName: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CANDIDATE") {
      return NextResponse.json(
        { error: "Only candidates can apply to jobs" },
        { status: 403 }
      );
    }

    const { jobId, coverLetter, resumeUrl } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            profile: {
              select: { companyName: true },
            },
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: session.user.id,
          jobId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already applied to this job" },
        { status: 400 }
      );
    }

    // Get candidate profile for resume URL if not provided
    let finalResumeUrl = resumeUrl;
    if (!finalResumeUrl) {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { cvUrl: true },
      });
      finalResumeUrl = profile?.cvUrl || null;
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        candidateId: session.user.id,
        jobId,
        companyId: job.companyId,
        coverLetter,
        resumeUrl: finalResumeUrl,
        status: "APPLIED",
      },
    });

    // Create notification for company
    await createNotification({
      userId: job.companyId,
      type: "NEW_JOB",
      title: "New Application Received",
      message: `You received a new application for ${job.title}`,
      link: `/dashboard/applications/${application.id}`,
      metadata: { applicationId: application.id, jobId },
      sendEmail: true,
    });

    // Create notification for candidate
    await createNotification({
      userId: session.user.id,
      type: "APPLICATION_STATUS",
      title: "Application Submitted",
      message: `Your application for ${job.title} at ${
        job.company.profile?.companyName || job.company.name
      } has been submitted`,
      link: `/dashboard/applications/${application.id}`,
      metadata: { applicationId: application.id },
    });

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Apply to job error:", error);
    return NextResponse.json(
      { error: "Failed to apply to job" },
      { status: 500 }
    );
  }
}
