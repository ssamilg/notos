import type { KeyboardEvent, Ref } from "react";
import { DateDisplay } from "@/components/DateDisplay";
import { cn } from "@/lib/utils";

type BreadcrumbHeaderProps = {
  parentLabel: string;
  title: string;
  onParentClick: () => void;
  isEditing?: boolean;
  isCompleted?: boolean;
  titleValue?: string;
  onTitleChange?: (value: string) => void;
  onTitleClick?: () => void;
  onTitleBlur?: () => void;
  onTitleKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  titleInputRef?: Ref<HTMLInputElement>;
  titleTabIndex?: number;
  titleAriaLabel?: string;
  disabled?: boolean;
  updatedAt?: string;
  className?: string;
};

export function BreadcrumbHeader({
  parentLabel,
  title,
  onParentClick,
  isEditing = false,
  isCompleted = false,
  titleValue = "",
  onTitleChange,
  onTitleClick,
  onTitleBlur,
  onTitleKeyDown,
  titleInputRef,
  titleTabIndex,
  titleAriaLabel = "Title",
  disabled = false,
  updatedAt,
  className,
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

  if (onTitleClick && !isEditing) {
    titleSegment = (
      <button
        type="button"
        className={cn(
          "cursor-pointer text-left text-foreground transition-colors hover:glow-text",
          isCompleted && "text-muted-foreground line-through"
        )}
        onClick={onTitleClick}
        tabIndex={0}
      >
        {title}
      </button>
    );
  }

  if (isEditing) {
    titleSegment = (
      <input
        ref={titleInputRef}
        className={cn(
          "input-edit-subtle w-full min-w-0 font-mono text-[1.1rem] tracking-tight text-foreground",
          isCompleted && "text-muted-foreground line-through"
        )}
        value={titleValue}
        onChange={(event) => onTitleChange?.(event.target.value)}
        onBlur={onTitleBlur}
        onKeyDown={onTitleKeyDown}
        aria-label={titleAriaLabel}
        disabled={disabled}
        tabIndex={titleTabIndex}
      />
    );
  }

  let trailing = null;

  if (updatedAt) {
    trailing = (
      <DateDisplay
        updatedAt={updatedAt}
        className="font-mono text-[0.95rem] text-muted-foreground"
      />
    );
  }

  return (
    <div className={cn("mb-4 flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-baseline gap-1 font-mono text-[1.1rem] tracking-tight text-muted-foreground">
          <div className="flex cursor-pointer items-baseline gap-1 transition-colors hover:text-foreground hover:glow-text">
            <button
              type="button"
              className="shrink-0"
              onClick={onParentClick}
              tabIndex={0}
            >
              ←
            </button>
            <button
              type="button"
              className="shrink-0"
              onClick={onParentClick}
              tabIndex={0}
            >
              {parentLabel}
            </button>
          </div>
          <span className="shrink-0" aria-hidden="true">
            /
          </span>
          <span className="min-w-0 flex-1 text-foreground">{titleSegment}</span>
        </div>
        {trailing}
      </div>
    </div>
  );
}
