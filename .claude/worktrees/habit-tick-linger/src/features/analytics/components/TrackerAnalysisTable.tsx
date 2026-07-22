import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatMatrixDate } from "@/lib/date";
import type { TrackerAnalysis } from "@/features/analytics/trackerAnalysis";

export function TrackerAnalysisTable({ analysis }: { analysis: TrackerAnalysis }) {
  const { dateKeys, valueText, fieldRows } = analysis;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground" />
            {dateKeys.map((key) => (
              <th
                key={key}
                className="min-w-44 px-4 py-3 text-left text-xs font-semibold text-muted-foreground"
              >
                {formatMatrixDate(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60">
            <th
              scope="row"
              className="sticky left-0 z-10 bg-card px-4 py-3 text-left text-sm font-semibold text-foreground"
            >
              Value
            </th>
            {dateKeys.map((key) => (
              <td
                key={key}
                className="min-w-44 whitespace-pre-wrap px-4 py-3 align-top text-xs text-muted-foreground"
              >
                {valueText[key]}
              </td>
            ))}
          </tr>
          {fieldRows.map((row) => (
            <tr key={row.fieldId} className="border-b border-border/60 last:border-0">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-card px-4 py-3 text-left text-sm font-semibold text-foreground"
              >
                {row.fieldName}
              </th>
              {dateKeys.map((key) => {
                const cell = row.cells[key] ?? { count: 0, entityNames: [] };
                const matched = cell.count > 0;
                return (
                  <td key={key} className="min-w-44 px-4 py-3 align-top text-xs">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded",
                          matched
                            ? "bg-emerald-500 text-white"
                            : "text-red-500",
                        )}
                      >
                        {matched ? <Check className="size-3" /> : <X className="size-3.5" />}
                      </span>
                      <span className="font-medium text-foreground">{cell.count}</span>
                      {matched && (
                        <span className="text-muted-foreground">
                          ({cell.entityNames.join(", ")})
                        </span>
                      )}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
