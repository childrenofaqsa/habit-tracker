import { TooltipProvider } from "@/common/components/ui/overlay/tooltip";
import { Toaster } from "@/common/components/ui/data/sonner";
import { ThemeManager } from "@/app/providers/ThemeManager";
import { SmoothScroll } from "@/app/providers/SmoothScroll";
import { CursorCompanion } from "@/common/components/motion/CursorCompanion";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <ThemeManager />
      <SmoothScroll>{children}</SmoothScroll>
      <CursorCompanion />
      <Toaster />
    </TooltipProvider>
  );
}
