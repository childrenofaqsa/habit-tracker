import { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "motion/react";
import { durations } from "@/lib/motionTokens";
import { useUiStore } from "@/store/useUiStore";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";
import { Skeleton } from "@/common/components/ui/data/skeleton";
import type { ViewId } from "@/lib/constants";

const views: Record<ViewId, React.LazyExoticComponent<() => React.ReactElement>> = {
  daily: lazy(() =>
    import("@/views/DailyView/DailyView").then((m) => ({ default: m.DailyView })),
  ),
  values: lazy(() =>
    import("@/views/ValuesView/ValuesView").then((m) => ({ default: m.ValuesView })),
  ),
  todo: lazy(() =>
    import("@/views/TodoView/TodoView").then((m) => ({ default: m.TodoView })),
  ),
  analytics: lazy(() =>
    import("@/views/AnalyticsView/AnalyticsView").then((m) => ({
      default: m.AnalyticsView,
    })),
  ),
};

export function ViewRouter() {
  const activeView = useUiStore((state) => state.activeView);
  const { reduced } = useMotionSettings();
  const ActiveView = views[activeView];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeView}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: durations.base }}
      >
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
          <ActiveView />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
