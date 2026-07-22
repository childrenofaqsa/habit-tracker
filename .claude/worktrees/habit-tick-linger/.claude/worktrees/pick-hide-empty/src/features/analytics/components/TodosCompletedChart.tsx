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
import { reverseChronologicalKeys, formatShortDate, toDateKey } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";

export function TodosCompletedChart({ days }: { days: number }) {
  const todos = useAppStore((state) => state.todos);
  const [hasSize, setHasSize] = useState(false);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node && node.offsetWidth > 0 && node.offsetHeight > 0) {
      setHasSize(true);
    }
  }, []);

  const data = useMemo(() => {
    const keys = reverseChronologicalKeys(days).reverse();
    const counts = new Map<string, number>(keys.map((k) => [k, 0]));
    for (const todo of todos) {
      if (!todo.completed || todo.completedAt === null) continue;
      const key = toDateKey(new Date(todo.completedAt));
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return keys.map((key) => ({
      day: formatShortDate(key),
      count: counts.get(key) ?? 0,
    }));
  }, [todos, days]);

  return (
    <div ref={containerRef} className="h-48 w-full">
      {hasSize && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 18, right: 4, left: -24, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={32} />
            <Tooltip
              cursor={{ fill: "var(--color-muted)" }}
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: unknown) => [String(value), "Completed"]}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]} isAnimationActive>
              <LabelList
                dataKey="count"
                position="top"
                fontSize={10}
                fill="var(--color-foreground)"
                formatter={(value) => {
                  const num = Number(value);
                  return num > 0 ? String(num) : "";
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
