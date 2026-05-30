import { useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { reverseChronologicalKeys, formatShortDate } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";

export function CompletionChart({ days }: { days: number }) {
  const history = useAppStore((state) => state.history);
  const [hasSize, setHasSize] = useState(false);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node && node.offsetWidth > 0 && node.offsetHeight > 0) {
      setHasSize(true);
    }
  }, []);

  const data = useMemo(() => {
    const keys = reverseChronologicalKeys(days).reverse();
    return keys.map((key) => {
      const record = history[key];
      let done = 0;
      let tracked = 0;
      if (record) {
        for (const status of Object.values(record.habitStatus)) {
          tracked += 1;
          if (status === "done") done += 1;
        }
      }
      return {
        day: formatShortDate(key),
        completion: tracked === 0 ? 0 : Math.round((done / tracked) * 100),
      };
    });
  }, [history, days]);

  return (
    <div ref={containerRef} className="h-48 w-full">
      {hasSize && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
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
