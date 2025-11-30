import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { uploadCV, deleteCV } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CANDIDATE") {
      return NextResponse.json(
        { error: "Only candidates can upload CVs" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("cv") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and DOC files are allowed" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Extract text from CV
    const extractFormData = new FormData();
    extractFormData.append("file", file);

    const extractResponse = await fetch(
      `${process.env.PYTHON_SERVICE_URL}/extract-cv-text`,
      {
        method: "POST",
        body: extractFormData,
      }
    );

    let cvText = "";
    if (extractResponse.ok) {
      const extractData = await extractResponse.json();
      cvText = extractData.text || "";
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile?.cvUrl) {
      try {
        await deleteCV(existingProfile.cvUrl);
      } catch (error) {
        console.error("Error deleting old CV:", error);
      }
    }

    const cvUrl = await uploadCV(file, session.user.id);

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        cvUrl,
        cvFileName: file.name,
        cvText,
        embeddingUpdatedAt: null, // Reset embedding timestamp
      },
      create: {
        userId: session.user.id,
        cvUrl,
        cvFileName: file.name,
        cvText,
        skills: [],
      },
    });

    return NextResponse.json({
      success: true,
      cvUrl: profile.cvUrl,
      textExtracted: cvText.length > 0,
    });
  } catch (error) {
    console.error("CV upload error:", error);
    return NextResponse.json({ error: "Failed to upload CV" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile?.cvUrl) {
      return NextResponse.json({ error: "No CV found" }, { status: 404 });
    }

    await deleteCV(profile.cvUrl);

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        cvUrl: null,
        cvFileName: null,
        cvText: null,
        embeddingUpdatedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "CV deleted successfully",
    });
  } catch (error) {
    console.error("CV delete error:", error);
    return NextResponse.json({ error: "Failed to delete CV" }, { status: 500 });
  }
}
