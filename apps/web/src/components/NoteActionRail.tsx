import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NoteActionRailProps = {
  children: ReactNode;
  className?: string;
  variant: "mobile" | "desktop";
};

export function NoteActionRail({ children, className, variant }: NoteActionRailProps) {
  const isMobile = variant === "mobile";

  return (
    <div
      className={cn(
        "flex-col items-start gap-5",
        isMobile
          ? "mb-10 flex flex-wrap md:hidden"
          : "hidden w-[140px] shrink-0 self-start md:sticky md:top-[var(--note-detail-sticky-offset,6rem)] md:z-10 md:flex md:pt-[45px]",
        className
      )}
    >
      {children}
    </div>
  );
}
