import { type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GlowButtonProps = ComponentProps<typeof Button>;

export function GlowButton({ className, variant = "outline", ...props }: GlowButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn(
        "uppercase tracking-wider glow-border hover:shadow-[var(--glow-intense)] hover:glow-text",
        className
      )}
      {...props}
    />
  );
}
