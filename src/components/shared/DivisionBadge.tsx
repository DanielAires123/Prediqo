import { Badge } from "@/components/ui/badge";
import { getDivision } from "@/types";

const DIVISION_COLORS: Record<string, string> = {
  BRONZE: "bg-amber-700/20 text-amber-700 dark:text-amber-400 border-amber-600/40",
  SILVER: "bg-zinc-400/20 text-zinc-700 dark:text-zinc-300 border-zinc-500/40",
  GOLD: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/40",
  PLATINUM: "bg-sky-400/20 text-sky-700 dark:text-sky-300 border-sky-500/40",
  ELITE: "bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/40",
};

export function DivisionBadge({ skillRating }: { skillRating: number }) {
  const division = getDivision(skillRating);
  return (
    <Badge
      variant="outline"
      className={DIVISION_COLORS[division] ?? ""}
    >
      {division}
    </Badge>
  );
}
