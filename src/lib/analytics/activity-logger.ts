import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function logActivity(params: {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: any;
}) {
  try {
    const headersList = headers();
    const ipAddress =
      (await headersList).get("x-forwarded-for") ||
      (await headersList).get("x-real-ip");
    const userAgent = (await headersList).get("user-agent");

    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
      },
    });
  } catch (error) {
    console.error("Activity logging error:", error);
    // Don't throw - logging failures shouldn't break the app
  }
}
