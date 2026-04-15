import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100+
  color?: "green" | "navy" | "red" | "auto";
  className?: string;
}

export function ProgressBar({ value, color = "auto", className }: ProgressBarProps) {
  const clampedValue = Math.min(value, 100);

  const resolvedColor =
    color !== "auto"
      ? color
      : value < 80
      ? "green"
      : value < 100
      ? "navy"
      : "red";

  return (
    <div className={cn("w-full h-1.5 rounded-full bg-outline-variant/20 overflow-hidden", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          resolvedColor === "green" && "bg-secondary",
          resolvedColor === "navy" && "bg-primary",
          resolvedColor === "red" && "bg-error"
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
