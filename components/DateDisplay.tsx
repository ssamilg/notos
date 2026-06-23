import { formatDate } from "@/utils/formatDate";
import { formatRelativeDate } from "@/utils/formatRelativeDate";
import { cn } from "@/lib/utils";

type DateDisplayProps = {
  updatedAt: string;
  createdAt?: string;
  className?: string;
};

function getDateLabel(createdAt: string | undefined, updatedAt: string) {
  let label = "Updated";

  if (createdAt) {
    const created = new Date(createdAt).getTime();
    const updated = new Date(updatedAt).getTime();

    if (Math.abs(updated - created) < 1000) {
      label = "Created";
    }
  }

  return label;
}

export function DateDisplay({ updatedAt, createdAt, className }: DateDisplayProps) {
  const relative = formatRelativeDate(updatedAt);
  const absolute = formatDate(updatedAt);
  const label = getDateLabel(createdAt, updatedAt);

  return (
    <time dateTime={updatedAt} title={`${label}: ${absolute}`} className={cn("text-caption", className)}>
      {label}: {relative}
    </time>
  );
}
