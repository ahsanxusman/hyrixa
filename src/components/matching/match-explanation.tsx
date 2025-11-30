"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

interface MatchExplanationProps {
  jobId: string;
  candidateId?: string;
  matchScore: number;
}

export function MatchExplanation({
  jobId,
  candidateId,
  matchScore,
}: MatchExplanationProps) {
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchExplanation = async () => {
    if (explanation) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/matching/explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, candidateId, matchScore }),
      });

      const data = await response.json();

      if (response.ok) {
        setExplanation(data.explanation);
        setIsExpanded(true);
      }
    } catch (err) {
      console.error("Failed to fetch explanation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={fetchExplanation}
        disabled={isLoading}
        className="text-blue-600 hover:text-blue-700 p-0 h-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating explanation...
          </>
        ) : (
          <>
            <MessageSquare className="mr-2 h-4 w-4" />
            Why this match?
            {explanation &&
              (isExpanded ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-1 h-4 w-4" />
              ))}
          </>
        )}
      </Button>

      {explanation && isExpanded && (
        <Card className="mt-3 p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-700">{explanation}</p>
        </Card>
      )}
    </div>
  );
}
