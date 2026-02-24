import { DivisionBadge } from "./DivisionBadge";

export function SkillRatingDisplay({ skillRating }: { skillRating: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono font-semibold">{skillRating}</span>
      <span className="text-zinc-500 text-sm">skill</span>
      <DivisionBadge skillRating={skillRating} />
    </div>
  );
}
