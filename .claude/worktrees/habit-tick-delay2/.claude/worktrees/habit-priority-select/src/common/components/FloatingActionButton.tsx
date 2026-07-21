import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type FloatingActionButtonProps = {
  onClick: () => void;
  className?: string;
};

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8",
        className,
      )}
    >
      <Plus className="size-6" />
    </button>
  );
}
