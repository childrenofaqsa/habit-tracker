import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type CategoryFilterProps = {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
  onAddCategory?: () => void;
};

export function CategoryFilter({
  categories,
  activeCategory,
  onSelect,
  onAddCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeCategory === category
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {category}
        </button>
      ))}
      {onAddCategory && (
        <button
          type="button"
          onClick={onAddCategory}
          aria-label="Add category"
          className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-3.5" />
          Category
        </button>
      )}
    </div>
  );
}
