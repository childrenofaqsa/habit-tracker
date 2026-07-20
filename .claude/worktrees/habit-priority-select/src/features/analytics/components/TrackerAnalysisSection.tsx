import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TrackerAnalysis } from "@/features/analytics/trackerAnalysis";
import { TrackerAnalysisTable } from "./TrackerAnalysisTable";

export function TrackerAnalysisSection({
  analysis,
  hasCatalog,
}: {
  analysis: TrackerAnalysis;
  hasCatalog: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/40"
      >
        <h2 className="text-lg font-semibold text-foreground">
          Tracker analysis: {analysis.trackerName}
        </h2>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="border-t border-border">
          {!hasCatalog ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              Define fields and entities to see analysis.
            </p>
          ) : analysis.dateKeys.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              No entries logged yet for this tracker.
            </p>
          ) : (
            <TrackerAnalysisTable analysis={analysis} />
          )}
        </div>
      )}
    </div>
  );
}
