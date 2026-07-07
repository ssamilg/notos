import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NoteContentFrameProps = {
  children: ReactNode;
  className?: string;
};

export function NoteContentFrame({ children, className }: NoteContentFrameProps) {
  const cornerClassName =
    "pointer-events-none absolute size-[15px] border-white/20 transition-colors duration-200 md:size-[25px] group-focus-within/content:border-white/45";

  return (
    <div className={cn("group/content relative flex-1 p-5 md:p-10", className)}>
      <span
        className={cn(cornerClassName, "top-0 left-0 border-t border-l")}
        aria-hidden="true"
      />
      <span
        className={cn(cornerClassName, "top-0 right-0 border-t border-r")}
        aria-hidden="true"
      />
      <span
        className={cn(cornerClassName, "bottom-0 left-0 border-b border-l")}
        aria-hidden="true"
      />
      <span
        className={cn(cornerClassName, "right-0 bottom-0 border-r border-b")}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
