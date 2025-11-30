"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Download, CheckCircle2, XCircle } from "lucide-react";

const SAMPLE_JSON = `[
  {
    "title": "Senior React Developer",
    "description": "We are looking for an experienced React developer...",
    "requirements": "5+ years of React experience, TypeScript proficiency",
    "responsibilities": "Build scalable web applications, mentor junior developers",
    "location": "San Francisco, CA",
    "jobType": "FULL_TIME",
    "experienceLevel": "SENIOR",
    "salaryMin": 120000,
    "salaryMax": 180000,
    "currency": "USD",
    "skills": ["React", "TypeScript", "Node.js"],
    "benefits": ["Health Insurance", "Remote Work"],
    "status": "ACTIVE"
  }
]`;

export default function BulkJobUpload() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_JSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-jobs.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    setError("");
    setResults(null);
    setIsLoading(true);

    try {
      const jobs = JSON.parse(jsonInput);

      const response = await fetch("/api/jobs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResults(data.results);

      if (data.results.created > 0) {
        setTimeout(() => {
          router.push("/dashboard/jobs");
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Jobs</CardTitle>
          <CardDescription>
            Paste your jobs in JSON format below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Maximum 50 jobs per upload</p>
            <Button variant="outline" size="sm" onClick={downloadSample}>
              <Download className="mr-2 h-4 w-4" />
              Download Sample
            </Button>
          </div>

          <Textarea
            placeholder="Paste JSON here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={15}
            className="font-mono text-sm"
            disabled={isLoading}
          />

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-blue-900">Upload completed!</p>
                  <div className="text-sm text-blue-800">
                    <p>✓ {results.created} jobs created successfully</p>
                    {results.failed > 0 && (
                      <p>✗ {results.failed} jobs failed</p>
                    )}
                  </div>
                  {results.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">
                        View errors
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                        {JSON.stringify(results.errors, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleUpload}
            disabled={isLoading || !jsonInput.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Jobs
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JSON Format</CardTitle>
          <CardDescription>Required fields for each job</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Required Fields:</p>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• title</li>
                  <li>• description</li>
                  <li>• requirements</li>
                  <li>• responsibilities</li>
                  <li>• location</li>
                  <li>• jobType</li>
                  <li>• experienceLevel</li>
                  <li>• skills (array)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Optional Fields:</p>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• salaryMin</li>
                  <li>• salaryMax</li>
                  <li>• currency</li>
                  <li>• benefits (array)</li>
                  <li>• status</li>
                  <li>• applicationDeadline</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
