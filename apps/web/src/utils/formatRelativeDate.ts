import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  isToday,
  isYesterday,
} from "date-fns";
import { formatDate } from "@/utils/formatDate";

const THREE_MONTHS = 3;

export function formatRelativeDate(isoDate: string) {
  const date = new Date(isoDate);
  const now = new Date();
  const months = differenceInMonths(now, date);

  if (months >= THREE_MONTHS) {
    return formatDate(isoDate);
  }

  let result = formatDate(isoDate);

  if (isToday(date)) {
    result = "Today";
  } else if (isYesterday(date)) {
    result = "Yesterday";
  } else {
    const days = differenceInDays(now, date);

    if (days > 0 && days < 7) {
      result = `${days}d`;
    } else {
      const weeks = differenceInWeeks(now, date);

      if (weeks > 0 && weeks < 5) {
        result = `${weeks}w`;
      } else if (months > 0) {
        result = `${months}mo`;
      }
    }
  }

  return result;
}
