import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { JobSchema } from "@/lib/validations/job";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const myJobs = searchParams.get("myJobs") === "true";

    if (myJobs) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (session.user.role !== "COMPANY") {
        return NextResponse.json(
          { error: "Only companies can view their jobs" },
          { status: 403 }
        );
      }

      const jobs = await prisma.job.findMany({
        where: { companyId: session.user.id },
        include: {
          company: {
            select: {
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
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ jobs });
    }

    const jobs = await prisma.job.findMany({
      where: { status: "ACTIVE" },
      include: {
        company: {
          select: {
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    if (session.user.role !== "COMPANY") {
      return NextResponse.json(
        { error: "Only companies can post jobs" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = JobSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid fields",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { applicationDeadline, ...data } = validation.data;

    const job = await prisma.job.create({
      data: {
        ...data,
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : null,
        companyId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
