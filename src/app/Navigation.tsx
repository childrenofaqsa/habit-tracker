import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/lib/motionTokens";
import { NAV_ITEMS, type NavItem } from "@/app/navConfig";
import { useUiStore } from "@/store/useUiStore";
import { useHaptics } from "@/common/hooks/useHaptics";
import { useRipple } from "@/common/components/motion/useRipple";

function NavButton({
  item,
  isActive,
  isSide,
  onSelect,
}: {
  item: NavItem;
  isActive: boolean;
  isSide: boolean;
  onSelect: () => void;
}) {
  const { onPointerDown, rippleLayer } = useRipple();
  const Icon = item.icon;

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onClick={onSelect}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex touch-target items-center justify-center gap-2 overflow-hidden text-sm font-medium transition-colors",
        isSide ? "justify-start rounded-lg px-3 py-3" : "flex-1 flex-col py-2",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {isActive && (
        <motion.span
          layoutId="nav-pill"
          transition={springs.snappy}
          className={cn(
            "absolute inset-0 -z-10 bg-primary/10",
            isSide ? "rounded-lg" : "mx-2 my-1 rounded-xl",
          )}
        />
      )}
      <Icon className="size-5 shrink-0" />
      <span className={cn(isSide ? "" : "text-[11px]")}>{item.label}</span>
      {rippleLayer}
    </button>
  );
}

export function Navigation({ orientation }: { orientation: "bottom" | "side" }) {
  const activeView = useUiStore((state) => state.activeView);
  const setActiveView = useUiStore((state) => state.setActiveView);
  const haptic = useHaptics();
  const isSide = orientation === "side";

  return (
    <nav
      className={cn(
        isSide
          ? "flex h-full w-56 flex-col gap-1 border-r border-border bg-card/60 p-3"
          : "fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-card/90 backdrop-blur-lg safe-bottom",
      )}
    >
      {NAV_ITEMS.map((item) => (
        <NavButton
          key={item.id}
          item={item}
          isSide={isSide}
          isActive={activeView === item.id}
          onSelect={() => {
            haptic("tap");
            setActiveView(item.id);
          }}
        />
      ))}
    </nav>
  );
}
