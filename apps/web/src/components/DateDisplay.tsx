import { formatDateTime, formatTime } from "@/utils/formatDateTime";
import { formatRelativeDate } from "@/utils/formatRelativeDate";
import { cn } from "@/lib/utils";
import { isToday, isYesterday } from "date-fns";

type DateDisplayProps = {
  updatedAt: string;
  createdAt?: string;
  className?: string;
};

function formatDisplayText(updatedAt: string) {
  const date = new Date(updatedAt);

  if (isToday(date)) {
    return {
      text: `Today, ${formatTime(updatedAt)}`,
      isToday: true,
    };
  }

  if (isYesterday(date)) {
    return {
      text: `Yesterday, ${formatTime(updatedAt)}`,
      isToday: false,
    };
  }

  return {
    text: formatRelativeDate(updatedAt),
    isToday: false,
  };
}

export function DateDisplay({ updatedAt, className }: DateDisplayProps) {
  const { text } = formatDisplayText(updatedAt);
  const absolute = formatDateTime(updatedAt);

  return (
    <time
      dateTime={updatedAt}
      title={absolute}
      className={cn(
        "text-caption shrink-0",
        className,
      )}
    >
      {text}
    </time>
  );
}
