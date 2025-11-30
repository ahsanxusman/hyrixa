import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/analytics/activity-logger";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountStatus, isAdmin } = await req.json();

    const user = await prisma.user.update({
      where: { id: params.userId },
      data: {
        ...(accountStatus && { accountStatus }),
        ...(isAdmin !== undefined && { isAdmin }),
      },
    });

    await logActivity({
      userId: session.user.id,
      action: "USER_UPDATED",
      entity: "user",
      entityId: params.userId,
      metadata: { accountStatus, isAdmin },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.delete({
      where: { id: params.userId },
    });

    await logActivity({
      userId: session.user.id,
      action: "USER_DELETED",
      entity: "user",
      entityId: params.userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
