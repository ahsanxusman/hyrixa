"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

interface SaveJobButtonProps {
  jobId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function SaveJobButton({
  jobId,
  variant = "outline",
  size = "default",
}: SaveJobButtonProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSaved();
  }, [jobId]);

  const checkSaved = async () => {
    try {
      const response = await fetch("/api/saved-jobs/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSaved(data.isSaved);
      }
    } catch (error) {
      console.error("Failed to check saved status:", error);
    }
  };

  const toggleSave = async () => {
    setIsLoading(true);

    try {
      if (isSaved) {
        const response = await fetch(`/api/saved-jobs?jobId=${jobId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsSaved(false);
          toast("Job unsaved", {
            description: "This job has been removed from your saved jobs",
          });
          router.refresh();
        }
      } else {
        const response = await fetch("/api/saved-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });

        if (response.ok) {
          setIsSaved(true);
          toast("Job saved", {
            description: "This job has been added to your saved jobs",
          });
          router.refresh();
        }
      }
    } catch (error) {
      toast("Error", {
        description: "Failed to save job",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleSave}
      disabled={isLoading}
    >
      <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
      {size !== "icon" && (isSaved ? "Saved" : "Save")}
    </Button>
  );
}
