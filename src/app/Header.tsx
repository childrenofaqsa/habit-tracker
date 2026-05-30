import { useUiStore } from "@/store/useUiStore";
import { VIEW_TITLES } from "@/app/navConfig";
import { HeaderActions } from "@/app/HeaderActions";

export function Header() {
  const activeView = useUiStore((state) => state.activeView);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-lg safe-top safe-x">
      <h1 className="text-lg font-semibold tracking-tight md:text-xl lg:text-2xl">
        {VIEW_TITLES[activeView]}
      </h1>
      <HeaderActions />
    </header>
  );
}
