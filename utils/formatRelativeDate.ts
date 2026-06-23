import {
  differenceInDays,
  differenceInWeeks,
  isToday,
  isYesterday,
} from "date-fns";
import { formatDate } from "@/utils/formatDate";

export function formatRelativeDate(isoDate: string) {
  const date = new Date(isoDate);
  let result = formatDate(isoDate);

  if (isToday(date)) {
    result = "Today";
  } else if (isYesterday(date)) {
    result = "Yesterday";
  } else {
    const days = differenceInDays(new Date(), date);

    if (days > 0 && days < 7) {
      result = `${days}d`;
    } else {
      const weeks = differenceInWeeks(new Date(), date);

      if (weeks > 0 && weeks < 5) {
        result = `${weeks}w`;
      }
    }
  }

  return result;
}
