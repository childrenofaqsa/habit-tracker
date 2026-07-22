import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { buildTrackerAnalysis } from "@/features/analytics/trackerAnalysis";
import { TrackerAnalysisSection } from "./TrackerAnalysisSection";

export function TrackerAnalysisList() {
  const values = useAppStore((state) => state.values);
  const fields = useAppStore((state) => state.fields);
  const entities = useAppStore((state) => state.entities);
  const history = useAppStore((state) => state.history);
  const habits = useAppStore((state) => state.habits);

  const habitNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const habit of habits) map[habit.id] = habit.title;
    return map;
  }, [habits]);

  const sortedFields = useMemo(
    () => [...fields].sort((a, b) => a.order - b.order),
    [fields],
  );

  const analyses = useMemo(() => {
    const trackers = values
      .filter((value) => value.analyzerEnabled && value.type === "text")
      .sort((a, b) => a.order - b.order);
    return trackers.map((tracker) =>
      buildTrackerAnalysis(tracker, sortedFields, entities, history, habitNames),
    );
  }, [values, sortedFields, entities, history, habitNames]);

  if (analyses.length === 0) return null;

  const hasCatalog = sortedFields.length > 0 && entities.length > 0;

  return (
    <div className="space-y-4">
      {analyses.map((analysis) => (
        <TrackerAnalysisSection
          key={analysis.trackerId}
          analysis={analysis}
          hasCatalog={hasCatalog}
        />
      ))}
    </div>
  );
}
