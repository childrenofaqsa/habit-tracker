import { useEffect, useState } from "react";
import { toast } from "sonner";
import { bootstrapStore } from "@/store/bootstrap";
import { AppShell } from "@/app/AppShell";
import { AppSkeleton } from "@/app/AppSkeleton";
import { ViewRouter } from "@/app/ViewRouter";
import { useKeyboardInsets } from "@/common/hooks/useKeyboardInsets";

export function App() {
  const [ready, setReady] = useState(false);
  useKeyboardInsets();

  useEffect(() => {
    let mounted = true;
    void bootstrapStore()
      .then((status) => {
        if (!mounted) return;
        setReady(true);
        if (status === "recovered") {
          toast.warning("Recovered your data", {
            description: "Some corrupted fields were safely reset; history preserved.",
          });
        }
      })
      .catch(() => {
        if (!mounted) return;
        setReady(true);
        toast.error("Failed to load app data");
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) return <AppSkeleton />;

  return (
    <AppShell>
      <ViewRouter />
    </AppShell>
  );
}
