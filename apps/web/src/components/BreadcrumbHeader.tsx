import type { Ref } from "react";
import { DateDisplay } from "@/components/DateDisplay";
import { cn } from "@/lib/utils";

type BreadcrumbHeaderProps = {
  projectName: string;
  title: string;
  isEditing: boolean;
  isCompleted: boolean;
  titleValue: string;
  updatedAt: string;
  onProjectClick: () => void;
  onTitleChange: (value: string) => void;
  titleInputRef?: Ref<HTMLInputElement>;
  titleTabIndex?: number;
  disabled?: boolean;
};

export function BreadcrumbHeader({
  projectName,
  title,
  isEditing,
  isCompleted,
  titleValue,
  updatedAt,
  onProjectClick,
  onTitleChange,
  titleInputRef,
  titleTabIndex,
  disabled = false,
}: BreadcrumbHeaderProps) {
  let titleSegment = (
    <span
      className={cn(
        "text-foreground",
        isCompleted && "text-muted-foreground line-through"
      )}
    >
      {title}
    </span>
  );

  if (isEditing) {
    titleSegment = (
      <input
        ref={titleInputRef}
        className={cn(
          "input-edit-subtle w-full min-w-0 font-mono text-[1.1rem] tracking-tight text-foreground",
          isCompleted && "text-muted-foreground line-through"
        )}
        value={titleValue}
        onChange={(event) => onTitleChange(event.target.value)}
        aria-label="Note title"
        disabled={disabled}
        tabIndex={titleTabIndex}
      />
    );
  }

  return (
    <div className="mb-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-baseline gap-1 font-mono text-[1.1rem] tracking-tight text-muted-foreground">
          <button
            type="button"
            className="shrink-0 cursor-pointer transition-colors hover:text-foreground hover:glow-text"
            onClick={onProjectClick}
            tabIndex={0}
          >
            ←
          </button>
          <button
            type="button"
            className="shrink-0 cursor-pointer transition-colors hover:text-foreground hover:glow-text"
            onClick={onProjectClick}
            tabIndex={0}
          >
            {projectName}
          </button>
          <span className="shrink-0" aria-hidden="true">
            /
          </span>
          <span className="min-w-0 flex-1 text-foreground">{titleSegment}</span>
        </div>
        <DateDisplay
          updatedAt={updatedAt}
          className="font-mono text-[0.95rem] text-muted-foreground"
        />
      </div>
    </div>
  );
}
