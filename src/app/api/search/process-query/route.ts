import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Process query with Python service
    const response = await fetch(
      `${process.env.PYTHON_SERVICE_URL}/process-search-query`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to process search query");
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      enhancedQuery: data.enhanced_query,
    });
  } catch (error) {
    console.error("Search query processing error:", error);
    return NextResponse.json(
      { error: "Failed to process search query" },
      { status: 500 }
    );
  }
}
