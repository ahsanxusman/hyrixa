import prisma from "@/lib/prisma";

export async function calculateDailyMetrics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  try {
    // User metrics
    const [totalUsers, newUsersToday, candidateCount, companyCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            createdAt: { gte: today },
          },
        }),
        prisma.user.count({
          where: { role: "CANDIDATE" },
        }),
        prisma.user.count({
          where: { role: "COMPANY" },
        }),
      ]);

    // Active users (logged in within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: { gte: sevenDaysAgo },
      },
    });

    // Job metrics
    const [totalJobs, activeJobs, newJobsToday] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({
        where: { status: "ACTIVE" },
      }),
      prisma.job.count({
        where: {
          createdAt: { gte: today },
        },
      }),
    ]);

    // Application metrics
    const [totalApplications, newApplicationsToday] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({
        where: {
          appliedAt: { gte: today },
        },
      }),
    ]);

    // Search metrics
    const totalSearches = await prisma.searchHistory.count({
      where: {
        createdAt: { gte: today },
      },
    });

    // Matching metrics (simplified - would need more complex calculation in production)
    const totalMatches = await prisma.notification.count({
      where: {
        type: "JOB_MATCH",
        createdAt: { gte: today },
      },
    });

    // Store or update analytics
    await prisma.analytics.upsert({
      where: { date: today },
      update: {
        totalUsers,
        newUsers: newUsersToday,
        activeUsers,
        candidateCount,
        companyCount,
        totalJobs,
        activeJobs,
        newJobs: newJobsToday,
        totalApplications,
        newApplications: newApplicationsToday,
        totalSearches,
        totalMatches,
        avgMatchScore: 0, // Would calculate from actual match data
      },
      create: {
        date: today,
        totalUsers,
        newUsers: newUsersToday,
        activeUsers,
        candidateCount,
        companyCount,
        totalJobs,
        activeJobs,
        newJobs: newJobsToday,
        totalApplications,
        newApplications: newApplicationsToday,
        totalSearches,
        totalMatches,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Metrics calculation error:", error);
    throw error;
  }
}

export async function getAnalytics(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const analytics = await prisma.analytics.findMany({
    where: {
      date: { gte: startDate },
    },
    orderBy: { date: "asc" },
  });

  return analytics;
}
