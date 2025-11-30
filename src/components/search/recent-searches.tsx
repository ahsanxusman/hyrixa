"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";

interface SearchHistoryItem {
  id: string;
  query: string;
  resultCount: number;
  createdAt: string;
}

interface RecentSearchesProps {
  onSearchClick: (query: string) => void;
}

export function RecentSearches({ onSearchClick }: RecentSearchesProps) {
  const [searches, setSearches] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      const response = await fetch("/api/search/history");
      const data = await response.json();

      if (response.ok) {
        setSearches(data.searches);
      }
    } catch (error) {
      console.error("Failed to fetch search history:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/search/history?id=${id}`, {
        method: "DELETE",
      });

      setSearches(searches.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete search:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch("/api/search/history", {
        method: "DELETE",
      });

      setSearches([]);
    } catch (error) {
      console.error("Failed to clear searches:", error);
    }
  };

  if (searches.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Searches</CardTitle>
            <CardDescription>Your search history</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {searches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
            >
              <button
                onClick={() => onSearchClick(search.query)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <Clock className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{search.query}</p>
                  <p className="text-xs text-gray-500">
                    {search.resultCount} results •{" "}
                    {new Date(search.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(search.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
