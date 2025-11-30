import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { JobSchema } from "@/lib/validations/job";
import { logActivity } from "@/lib/analytics/activity-logger";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "COMPANY") {
      return NextResponse.json(
        { error: "Only companies can post jobs" },
        { status: 403 }
      );
    }

    const { jobs } = await req.json();

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { error: "Jobs array is required" },
        { status: 400 }
      );
    }

    if (jobs.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 jobs per bulk upload" },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (let i = 0; i < jobs.length; i++) {
      try {
        const validation = JobSchema.safeParse(jobs[i]);

        if (!validation.success) {
          results.failed++;
          results.errors.push({
            index: i,
            error: validation.error.flatten().fieldErrors,
          });
          continue;
        }

        const { applicationDeadline, ...data } = validation.data;

        await prisma.job.create({
          data: {
            ...data,
            applicationDeadline: applicationDeadline
              ? new Date(applicationDeadline)
              : null,
            companyId: session.user.id,
          },
        });

        results.created++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    await logActivity({
      userId: session.user.id,
      action: "BULK_JOB_CREATED",
      entity: "job",
      metadata: { created: results.created, failed: results.failed },
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Bulk job creation error:", error);
    return NextResponse.json(
      { error: "Failed to create jobs" },
      { status: 500 }
    );
  }
}
