import Link from "next/link";
import { cn } from "@/lib/utils";

type SkipLinkProps = {
  href?: string;
};

export function SkipLink({ href = "#main-content" }: SkipLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground",
        "focus:ring-3 focus:ring-ring/50 focus:outline-none"
      )}
    >
      Skip to main content
    </Link>
  );
}
