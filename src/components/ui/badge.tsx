import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      variant === "default" && "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900",
      variant === "secondary" && "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
      variant === "outline" && "border border-zinc-300 dark:border-zinc-700",
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge };
