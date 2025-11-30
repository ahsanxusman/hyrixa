import { NextResponse } from "next/server";
import { calculateDailyMetrics } from "@/lib/analytics/metrics";

export async function GET(req: Request) {
  try {
    // Verify cron secret (for Vercel Cron or similar)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await calculateDailyMetrics();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to calculate metrics" },
      { status: 500 }
    );
  }
}
