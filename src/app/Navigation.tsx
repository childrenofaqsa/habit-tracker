import { motion } from "motion/react";
import { Settings, HelpCircle } from "lucide-react";
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
        "relative flex touch-target items-center overflow-hidden text-sm font-medium transition-colors",
        isSide
          ? "w-full justify-start gap-3 rounded-xl px-4 py-3"
          : "flex-1 flex-col justify-center gap-1 py-2",
        isActive && isSide
          ? "bg-primary text-primary-foreground"
          : isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
      )}
    >
      {isActive && !isSide && (
        <motion.span
          layoutId="nav-pill"
          transition={springs.snappy}
          className="absolute inset-0 -z-10 mx-2 my-1 rounded-xl bg-primary/10"
        />
      )}
      <Icon className="size-5 shrink-0" />
      <span className={cn(isSide ? "text-sm" : "text-[11px]")}>{item.label}</span>
      {rippleLayer}
    </button>
  );
}

function SidebarFooterButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Settings;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <Icon className="size-5 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

export function Navigation({ orientation }: { orientation: "bottom" | "side" }) {
  const activeView = useUiStore((state) => state.activeView);
  const setActiveView = useUiStore((state) => state.setActiveView);
  const haptic = useHaptics();
  const isSide = orientation === "side";

  if (isSide) {
    return (
      <nav className="flex h-full w-60 flex-col border-r border-border bg-card/60">
        <div className="px-5 pb-4 pt-6">
          <h2 className="text-xl font-bold text-primary">Routinely</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Productivity Workspace
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-1 px-3 py-2">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isSide
              isActive={activeView === item.id}
              onSelect={() => {
                haptic("tap");
                setActiveView(item.id);
              }}
            />
          ))}
        </div>

        <div className="mt-auto border-t border-border px-3 py-3">
          <SidebarFooterButton icon={Settings} label="Settings" />
          <SidebarFooterButton icon={HelpCircle} label="Help" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-card/90 backdrop-blur-lg safe-bottom">
      {NAV_ITEMS.map((item) => (
        <NavButton
          key={item.id}
          item={item}
          isSide={false}
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
