import { Search, Bell } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { VIEW_TITLES } from "@/app/navConfig";
import { HeaderActions } from "@/app/HeaderActions";

const SEARCH_PLACEHOLDERS: Record<string, string> = {
  daily: "Search habits...",
  todo: "Search tasks...",
  values: "Search updates...",
  analytics: "Search insights...",
};

export function Header() {
  const activeView = useUiStore((state) => state.activeView);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-6 py-3 backdrop-blur-lg safe-top safe-x">
      <h1 className="text-lg font-semibold tracking-tight md:text-xl lg:text-2xl">
        {VIEW_TITLES[activeView]}
      </h1>

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={SEARCH_PLACEHOLDERS[activeView] ?? "Search..."}
            className="h-9 w-full rounded-full border border-border bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="size-5" />
          <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive" />
        </button>
        <div className="size-8 overflow-hidden rounded-full bg-primary/20">
          <div className="flex size-full items-center justify-center text-xs font-semibold text-primary">
            U
          </div>
        </div>
        <HeaderActions />
      </div>
    </header>
  );
}
