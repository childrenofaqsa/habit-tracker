import { useState } from "react";
import { Download, Share } from "lucide-react";
import { Button } from "@/common/components/ui/data/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/overlay/dialog";
import { useInstallPrompt } from "@/features/install/useInstallPrompt";

export function InstallSection() {
  const { hidden, canPrompt, isIOS, promptInstall } = useInstallPrompt();
  const [open, setOpen] = useState(false);

  if (hidden) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Install app</h3>
      {canPrompt ? (
        <Button size="sm" variant="outline" onClick={promptInstall}>
          <Download className="size-4" /> Install
        </Button>
      ) : (
        <>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            <Download className="size-4" /> How to install
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Install this app</DialogTitle>
                <DialogDescription>Add it to your home screen for offline use.</DialogDescription>
              </DialogHeader>
              {isIOS ? (
                <ol className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Share className="size-4 text-primary" /> Tap the Share button in Safari.
                  </li>
                  <li>Scroll down and tap "Add to Home Screen".</li>
                  <li>Tap "Add" to finish.</li>
                </ol>
              ) : (
                <ol className="space-y-2 text-sm">
                  <li>Open your browser menu (⋮ or ☰).</li>
                  <li>Choose "Install app" or "Add to Home Screen".</li>
                  <li>Confirm to install for offline use.</li>
                </ol>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
