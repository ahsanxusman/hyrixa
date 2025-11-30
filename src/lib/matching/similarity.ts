export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

export function calculateMatchScore(similarity: number): number {
  // Convert similarity (0-1) to percentage (0-100)
  // Apply curve to make scoring more intuitive
  const baseScore = similarity * 100;

  // Apply sigmoid-like transformation for better distribution
  const adjustedScore = Math.min(100, Math.max(0, baseScore * 1.2 - 10));

  return Math.round(adjustedScore);
}

export function getMatchLevel(score: number): {
  level: string;
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      level: "Excellent",
      color: "green",
      description: "Highly recommended match",
    };
  } else if (score >= 65) {
    return {
      level: "Good",
      color: "blue",
      description: "Strong potential match",
    };
  } else if (score >= 50) {
    return {
      level: "Fair",
      color: "yellow",
      description: "Moderate match",
    };
  } else {
    return {
      level: "Low",
      color: "gray",
      description: "Limited alignment",
    };
  }
}
