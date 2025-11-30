import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "AI Job Portal",
  },
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openrouter.embeddings.create({
      model: "openai/text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

export async function generateMatchExplanation(
  candidateProfile: string,
  jobDescription: string,
  matchScore: number
): Promise<string> {
  try {
    const prompt = `You are an expert career advisor. Analyze the following candidate profile and job description to explain why they are a ${matchScore}% match.

Candidate Profile:
${candidateProfile}

Job Description:
${jobDescription}

Provide a concise explanation (2-3 sentences) highlighting:
1. Key matching skills and qualifications
2. Relevant experience alignment
3. Any notable gaps or areas for growth

Keep it professional and constructive.`;

    const response = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return (
      response.choices[0].message.content || "Match explanation not available."
    );
  } catch (error) {
    console.error("Error generating match explanation:", error);
    return "Unable to generate match explanation at this time.";
  }
}

export { openrouter };
