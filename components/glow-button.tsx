import { type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GlowButtonProps = ComponentProps<typeof Button>;

export function GlowButton({ className, variant = "outline", ...props }: GlowButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn(
        "text-label glow-border uppercase tracking-wider hover:glow-text",
        className
      )}
      {...props}
    />
  );
}
