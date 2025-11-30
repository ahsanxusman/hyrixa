import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAnalytics, calculateDailyMetrics } from "@/lib/analytics/metrics";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const analytics = await getAnalytics(days);

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await calculateDailyMetrics();

    return NextResponse.json({
      success: true,
      message: "Metrics calculated successfully",
    });
  } catch (error) {
    console.error("Calculate metrics error:", error);
    return NextResponse.json(
      { error: "Failed to calculate metrics" },
      { status: 500 }
    );
  }
}
