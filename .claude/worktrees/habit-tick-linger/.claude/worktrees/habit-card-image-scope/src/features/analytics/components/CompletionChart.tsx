import { useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  LabelList,
} from "recharts";
import { reverseChronologicalKeys, formatShortDate } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import { selectScheduledCompletion } from "@/store/selectors";

export function CompletionChart({ days }: { days: number }) {
  const history = useAppStore((state) => state.history);
  const habits = useAppStore((state) => state.habits);
  const [hasSize, setHasSize] = useState(false);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node && node.offsetWidth > 0 && node.offsetHeight > 0) {
      setHasSize(true);
    }
  }, []);

  const data = useMemo(() => {
    const keys = reverseChronologicalKeys(days).reverse();
    const state = useAppStore.getState();
    return keys.map((key) => ({
      day: formatShortDate(key),
      completion: selectScheduledCompletion(state, key),
    }));
    // history & habits drive recompute via subscription; selector reads via getState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, habits, days]);

  return (
    <div ref={containerRef} className="h-48 w-full">
      {hasSize && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 18, right: 4, left: -24, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} width={32} />
            <Tooltip
              cursor={{ fill: "var(--color-muted)" }}
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: unknown) => [`${String(value)}%`, "Completion"]}
            />
            <Bar dataKey="completion" radius={[3, 3, 0, 0]} isAnimationActive>
              <LabelList
                dataKey="completion"
                position="top"
                fontSize={10}
                fill="var(--color-foreground)"
                formatter={(value) => {
                  const num = Number(value);
                  return num > 0 ? `${num}%` : "";
                }}
              />
              {data.map((entry) => (
                <Cell key={entry.day} fill="var(--color-primary)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
