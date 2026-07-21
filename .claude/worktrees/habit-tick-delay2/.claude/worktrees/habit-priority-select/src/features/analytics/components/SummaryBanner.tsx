import { Flame } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { selectTodaySummary, selectStreak } from "@/store/selectors";
import { Card, CardContent } from "@/common/components/ui/data/card";
import { CountUp } from "@/common/components/motion/CountUp";
import { FlipDigits } from "@/common/components/motion/FlipDigits";
import { TextScramble } from "@/common/components/motion/TextScramble";
import { Tilt } from "@/common/components/motion/Tilt";
import { Spotlight } from "@/common/components/motion/Spotlight";

const MILESTONES = new Set([7, 30, 100]);

export function SummaryBanner() {
  const summary = useAppStore(useShallow(selectTodaySummary));
  const streak = useAppStore(selectStreak);

  const stats = [
    { label: "Completion", value: summary.completion, suffix: "%" },
    { label: "Done", value: summary.done, suffix: "" },
    { label: "Missed", value: summary.missed, suffix: "" },
    { label: "Total", value: summary.total, suffix: "" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Flame className="size-5 text-orange-500" />
        <FlipDigits value={streak} className="inline-flex" />
        <span>day streak</span>
        {MILESTONES.has(streak) && (
          <TextScramble
            text="MILESTONE!"
            className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold tracking-widest text-primary"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Tilt key={stat.label}>
            <Spotlight className="rounded-lg">
              <Card>
                <CardContent className="p-4">
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    className="block text-2xl font-bold tabular-nums lg:text-3xl"
                  />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </CardContent>
              </Card>
            </Spotlight>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
