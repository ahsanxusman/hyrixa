import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications/service";
import { sendApplicationStatusEmail } from "@/lib/mail";

export async function GET(
  req: Request,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await prisma.application.findUnique({
      where: { id: params.applicationId },
      include: {
        job: true,
        candidate: {
          include: {
            profile: true,
          },
        },
        company: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (
      application.candidateId !== session.user.id &&
      application.companyId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, notes } = await req.json();

    const application = await prisma.application.findUnique({
      where: { id: params.applicationId },
      include: {
        job: true,
        candidate: {
          select: {
            email: true,
            name: true,
          },
        },
        company: {
          select: {
            profile: {
              select: { companyName: true },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Only company can update status
    if (status && application.companyId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only candidate can update notes
    if (notes && application.candidateId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.application.update({
      where: { id: params.applicationId },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    // Send notification to candidate if status changed
    if (status && status !== application.status) {
      await createNotification({
        userId: application.candidateId,
        type: "APPLICATION_STATUS",
        priority: "HIGH",
        title: "Application Status Updated",
        message: `Your application for ${application.job.title} has been updated to ${status}`,
        link: `/dashboard/applications/${application.id}`,
        metadata: { applicationId: application.id, status },
        sendEmail: true,
      });

      // Send email notification
      await sendApplicationStatusEmail(
        application.candidate.email!,
        application.job.title,
        application.company.profile?.companyName || "",
        status,
        application.id
      ).catch((error) => {
        console.error("Failed to send status email:", error);
      });
    }

    return NextResponse.json({
      success: true,
      application: updated,
    });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await prisma.application.findUnique({
      where: { id: params.applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Only candidate can withdraw
    if (application.candidateId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.application.update({
      where: { id: params.applicationId },
      data: { status: "WITHDRAWN" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Withdraw application error:", error);
    return NextResponse.json(
      { error: "Failed to withdraw application" },
      { status: 500 }
    );
  }
}
