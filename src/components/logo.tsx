import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withText?: boolean;
}

export function Logo({ className, size = "md", withText = false }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-slow">
          <img src="/logo.svg" alt="Logo" className="w-full h-full" />
        </div>
      </div>

      {withText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-tight tracking-tight text-foreground">
            When to Eat
          </span>
        </div>
      )}
    </div>
  );
}
