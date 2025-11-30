import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CANDIDATE") {
      return NextResponse.json(
        { error: "Only candidates can extract CV text" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Forward to Python service
    const pythonFormData = new FormData();
    pythonFormData.append("file", file);

    const pythonResponse = await fetch(
      `${process.env.PYTHON_SERVICE_URL}/extract-cv-text`,
      {
        method: "POST",
        body: pythonFormData,
      }
    );

    if (!pythonResponse.ok) {
      const error = await pythonResponse.json();
      throw new Error(error.detail || "Failed to extract text");
    }

    const data = await pythonResponse.json();

    return NextResponse.json({
      success: true,
      text: data.text,
      length: data.length,
    });
  } catch (error) {
    console.error("CV text extraction error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to extract CV text",
      },
      { status: 500 }
    );
  }
}
