import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

type AutoResizeTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  tabIndex?: number;
  placeholder?: string;
  "aria-label"?: string;
};

function syncTextareaHeight(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  function AutoResizeTextarea(
    {
      value,
      onChange,
      className,
      disabled = false,
      tabIndex,
      placeholder,
      "aria-label": ariaLabel,
    },
    ref
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    useEffect(() => {
      const textarea = textareaRef.current;

      if (!textarea) {
        return;
      }

      syncTextareaHeight(textarea);
    }, [value]);

    function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
      onChange(event.target.value);
      syncTextareaHeight(event.target);
    }

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        className={cn(
          "input-bare text-body w-full resize-none overflow-hidden leading-relaxed",
          className
        )}
        disabled={disabled}
        tabIndex={tabIndex}
        placeholder={placeholder}
        aria-label={ariaLabel}
        rows={1}
      />
    );
  }
);
