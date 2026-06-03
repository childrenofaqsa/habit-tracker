import { EditModeToggle } from "@/features/editmode/EditModeToggle";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <EditModeToggle />
    </div>
  );
}
