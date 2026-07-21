import { Bell } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { VIEW_TITLES } from "@/app/navConfig";
import { HeaderActions } from "@/app/HeaderActions";

export function Header() {
  const activeView = useUiStore((state) => state.activeView);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-6 py-3 backdrop-blur-lg safe-top safe-x">
      {activeView === "daily" ? (
        <div className="w-px" aria-hidden="true" />
      ) : (
        <h1 className="text-lg font-semibold tracking-tight md:text-xl lg:text-2xl">
          {VIEW_TITLES[activeView]}
        </h1>
      )}

      <div className="flex flex-1" aria-hidden="true" />

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
