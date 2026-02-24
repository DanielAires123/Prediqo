"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  onValueChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, value, onValueChange, ...props }, ref) => (
    <input
      type="range"
      ref={ref}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onValueChange?.(Number(e.target.value))}
      className={cn(
        "w-full h-2 rounded-full appearance-none bg-zinc-200 dark:bg-zinc-800 accent-zinc-900 dark:accent-zinc-50",
        className
      )}
      {...props}
    />
  )
);
Slider.displayName = "Slider";

export { Slider };
