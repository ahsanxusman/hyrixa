import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  CandidateProfileSchema,
  CompanyProfileSchema,
} from "@/lib/validations/profile";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
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

    const body = await req.json();
    const userRole = session.user.role;

    let validatedData;

    if (userRole === "CANDIDATE") {
      const validation = CandidateProfileSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Invalid fields",
            details: validation.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }
      validatedData = validation.data;
    } else if (userRole === "COMPANY") {
      const validation = CompanyProfileSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Invalid fields",
            details: validation.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }
      validatedData = validation.data;
    } else {
      return NextResponse.json({ error: "Invalid user role" }, { status: 400 });
    }

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        ...validatedData,
        isComplete: true,
      },
      create: {
        userId: session.user.id,
        ...validatedData,
        isComplete: true,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
