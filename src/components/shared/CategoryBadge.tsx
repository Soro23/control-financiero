import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  categoryName: string;
  type: "income" | "expense";
  className?: string;
}

export function CategoryBadge({ categoryName, type, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
        type === "income"
          ? "bg-secondary/10 text-secondary"
          : "bg-primary/10 text-primary",
        className
      )}
    >
      {categoryName}
    </span>
  );
}
