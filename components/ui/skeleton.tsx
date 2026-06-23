import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse bg-white/10 mt-10", className)}
      {...props}
    />
  );
}

export { Skeleton };
