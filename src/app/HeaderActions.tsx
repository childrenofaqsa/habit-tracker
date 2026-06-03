import { EditModeToggle } from "@/features/editmode/EditModeToggle";
import { useUiStore } from "@/store/useUiStore";

export function HeaderActions() {
  const activeView = useUiStore((state) => state.activeView);
  return (
    <div className="flex items-center gap-1 sm:gap-3">
      {activeView !== "daily" && <EditModeToggle />}
    </div>
  );
}
