import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NoteContentFrameProps = {
  children: ReactNode;
  className?: string;
};

export function NoteContentFrame({ children, className }: NoteContentFrameProps) {
  return (
    <div className={cn("relative flex-1 p-5 md:p-10", className)}>
      <span
        className="pointer-events-none absolute top-0 left-0 size-[15px] border-t border-l border-white/20 md:size-[25px]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute top-0 right-0 size-[15px] border-t border-r border-white/20 md:size-[25px]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute bottom-0 left-0 size-[15px] border-b border-l border-white/20 md:size-[25px]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute right-0 bottom-0 size-[15px] border-r border-b border-white/20 md:size-[25px]"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
