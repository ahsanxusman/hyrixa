import { Badge } from "@/components/ui/badge";
import { getMatchLevel } from "@/lib/matching/similarity";

interface MatchScoreBadgeProps {
  score: number;
  showDescription?: boolean;
}

export function MatchScoreBadge({
  score,
  showDescription = false,
}: MatchScoreBadgeProps) {
  const { level, color, description } = getMatchLevel(score);

  const colorClasses = {
    green: "bg-green-100 text-green-800 border-green-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <div className="flex items-center gap-2">
      <Badge
        className={`${colorClasses[color as keyof typeof colorClasses]} border`}
      >
        {score}% Match
      </Badge>
      {showDescription && (
        <span className="text-sm text-gray-600">{description}</span>
      )}
    </div>
  );
}
