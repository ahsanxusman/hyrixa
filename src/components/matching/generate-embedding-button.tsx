"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

interface GenerateEmbeddingButtonProps {
  type: "profile" | "job";
  jobId?: string;
  onSuccess?: () => void;
}

export function GenerateEmbeddingButton({
  type,
  jobId,
  onSuccess,
}: GenerateEmbeddingButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint =
        type === "profile"
          ? "/api/ai/generate-profile-embedding"
          : "/api/ai/generate-job-embedding";

      const body = type === "job" ? JSON.stringify({ jobId }) : undefined;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate embedding");
      }

      setSuccess(data.message);
      router.refresh();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating AI Profile...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            {type === "profile"
              ? "Generate AI Profile"
              : "Generate AI Match Profile"}
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        This will analyze your{" "}
        {type === "profile" ? "profile and CV" : "job posting"} to enable AI
        matching
      </p>
    </div>
  );
}
