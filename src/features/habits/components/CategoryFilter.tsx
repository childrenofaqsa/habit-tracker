import { cn } from "@/lib/cn";

type CategoryFilterProps = {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
};

export function CategoryFilter({
  categories,
  activeCategory,
  onSelect,
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
    </div>
  );
}
