import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalUsers,
      totalCandidates,
      totalCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      totalNotifications,
      unreadNotifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CANDIDATE" } }),
      prisma.user.count({ where: { role: "COMPANY" } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: "ACTIVE" } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: "APPLIED" } }),
      prisma.notification.count(),
      prisma.notification.count({ where: { read: false } }),
    ]);

    // Get recent activity count (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const [newUsersToday, newJobsToday, newApplicationsToday] =
      await Promise.all([
        prisma.user.count({
          where: { createdAt: { gte: yesterday } },
        }),
        prisma.job.count({
          where: { createdAt: { gte: yesterday } },
        }),
        prisma.application.count({
          where: { appliedAt: { gte: yesterday } },
        }),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          candidates: totalCandidates,
          companies: totalCompanies,
          newToday: newUsersToday,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          newToday: newJobsToday,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          newToday: newApplicationsToday,
        },
        notifications: {
          total: totalNotifications,
          unread: unreadNotifications,
        },
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
