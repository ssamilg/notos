import { cn } from "@/lib/utils";

type TagDisplayProps = {
  tags: string[];
  className?: string;
};

function formatTagList(tags: string[]) {
  const formatted = tags.map((tag) => `#${tag}`);

  if (formatted.length === 1) {
    return formatted[0];
  }

  return `[${formatted.join(", ")}]`;
}

export function TagDisplay({ tags, className }: TagDisplayProps) {
  if (tags.length === 0) {
    return (
      <span className={cn("text-caption text-muted-foreground", className)}>No tags</span>
    );
  }

  return (
    <span className={cn("text-caption shrink-0", className)}>{formatTagList(tags)}</span>
  );
}
