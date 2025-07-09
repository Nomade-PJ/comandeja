import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "linear" | "spinner" | "skeleton";
  progress?: number;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
}

export function LoadingIndicator({
  variant = "linear",
  progress,
  size = "md",
  showText = false,
  text = "Carregando...",
  className,
  ...props
}: LoadingIndicatorProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (progress !== undefined) {
      setValue(progress);
      return;
    }

    // Simular progresso automático
    const interval = setInterval(() => {
      setValue((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 90);
      });
    }, 300);

    return () => clearInterval(interval);
  }, [progress]);

  // Mapear tamanhos para classes
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  // Renderizar indicador linear
  if (variant === "linear") {
    return (
      <div
        className={cn("w-full space-y-2", className)}
        {...props}
      >
        <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", sizeClasses[size])}>
          <div
            className="bg-gradient-to-r from-brand-400 to-brand-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${value}%` }}
          />
        </div>
        {showText && (
          <div className="text-center text-sm text-gray-500">
            {text} {progress !== undefined && `(${Math.round(progress)}%)`}
          </div>
        )}
      </div>
    );
  }

  // Renderizar spinner
  if (variant === "spinner") {
    const spinnerSizes = {
      sm: "h-4 w-4",
      md: "h-8 w-8",
      lg: "h-12 w-12",
    };

    return (
      <div
        className={cn("flex flex-col items-center justify-center", className)}
        {...props}
      >
        <div
          className={cn(
            "animate-spin rounded-full border-b-2 border-brand-600",
            spinnerSizes[size]
          )}
        />
        {showText && (
          <div className="mt-2 text-sm text-gray-500">{text}</div>
        )}
      </div>
    );
  }

  // Renderizar skeleton
  if (variant === "skeleton") {
    const skeletonSizes = {
      sm: "h-4",
      md: "h-6",
      lg: "h-8",
    };

    return (
      <div
        className={cn("space-y-2 w-full", className)}
        {...props}
      >
        <div
          className={cn(
            "animate-pulse bg-gray-200 rounded-md w-full",
            skeletonSizes[size]
          )}
        />
        {showText && (
          <div className="text-center text-sm text-gray-500">{text}</div>
        )}
      </div>
    );
  }

  return null;
} 