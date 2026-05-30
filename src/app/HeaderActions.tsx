import { EditModeToggle } from "@/features/editmode/EditModeToggle";
import { InstallButton } from "@/features/install/InstallButton";
import { BackupButton } from "@/features/backup/BackupButton";
import { SettingsButton } from "@/features/settings/SettingsButton";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <InstallButton />
      <EditModeToggle />
      <BackupButton />
      <SettingsButton />
    </div>
  );
}
