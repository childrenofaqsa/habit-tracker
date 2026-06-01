import { Settings } from "lucide-react";
import { Button } from "@/common/components/ui/data/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/common/components/ui/overlay/sheet";
import { Separator } from "@/common/components/ui/data/separator";
import { Switch } from "@/common/components/ui/form/switch";
import { Label } from "@/common/components/ui/form/label";
import { Input } from "@/common/components/ui/form/input";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import type { MotionSettings } from "@/lib/schema";
import { Segmented } from "@/features/settings/Segmented";

const motionToggles: {
  key: Exclude<keyof MotionSettings, "intensity">;
  label: string;
}[] = [
  { key: "scrollAnimations", label: "Scroll animations" },
  { key: "parallax", label: "Parallax effects" },
  { key: "cursorEffects", label: "Cursor effects (desktop)" },
  { key: "haptics", label: "Haptic feedback" },
  { key: "sound", label: "Sound effects" },
  { key: "confetti", label: "Celebration confetti" },
  { key: "respectReducedMotion", label: "Respect system reduce-motion" },
];

export function SettingsButton() {
  const theme = useAppStore((state) => state.settings.theme);
  const deviceLabel = useAppStore((state) => state.settings.deviceLabel);
  const motion = useAppStore((state) => state.settings.motion);
  const setTheme = useAppStore((state) => state.setTheme);
  const setDeviceLabel = useAppStore((state) => state.setDeviceLabel);
  const updateMotion = useAppStore((state) => state.updateMotion);
  const settingsOpen = useUiStore((state) => state.settingsOpen);
  const setSettingsOpen = useUiStore((state) => state.setSettingsOpen);

  return (
    <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="touch-target" aria-label="Settings">
          <Settings className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="space-y-6">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Personalize appearance and motion.</SheetDescription>
        </SheetHeader>

        <div className="space-y-2">
          <Label>Theme</Label>
          <Segmented
            value={theme}
            onChange={setTheme}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="device-label">Device label</Label>
          <Input
            id="device-label"
            value={deviceLabel}
            onChange={(event) => setDeviceLabel(event.target.value)}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Motion intensity</Label>
            <Segmented
              value={motion.intensity}
              onChange={(intensity) => updateMotion({ intensity })}
              options={[
                { value: "minimal", label: "Minimal" },
                { value: "standard", label: "Standard" },
                { value: "playful", label: "Playful" },
              ]}
            />
          </div>

          {motionToggles.map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between">
              <Label htmlFor={toggle.key}>{toggle.label}</Label>
              <Switch
                id={toggle.key}
                checked={motion[toggle.key]}
                onCheckedChange={(checked) => updateMotion({ [toggle.key]: checked })}
              />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
