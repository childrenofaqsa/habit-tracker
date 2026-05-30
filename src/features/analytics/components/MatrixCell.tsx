import { Check, X, FileText } from "lucide-react";
import type { DayRecord } from "@/lib/schema";
import type { MatrixRow } from "@/features/analytics/matrixData";

type Props = {
  row: MatrixRow;
  record: DayRecord | undefined;
  height: number;
  onOpenText: (name: string, text: string) => void;
};

export function MatrixCell({ row, record, height, onOpenText }: Props) {
  const base = "flex items-center justify-center border-b border-l border-border";

  if (row.kind === "habit") {
    const status = record?.habitStatus[row.id];
    return (
      <div className={base} style={{ height }}>
        {status === "done" && <Check className="size-3.5 text-success" />}
        {status === "missed" && <X className="size-3.5 text-destructive" />}
      </div>
    );
  }

  const entry = record?.valueEntries[row.id];
  if (entry === undefined) return <div className={base} style={{ height }} />;

  if (row.valueType === "numeric") {
    return (
      <div className={base} style={{ height }}>
        <span className="text-[11px] tabular-nums">{String(entry)}</span>
      </div>
    );
  }

  return (
    <div className={base} style={{ height }}>
      <button
        type="button"
        aria-label="View note"
        onClick={() => onOpenText(row.name, String(entry))}
        className="text-muted-foreground hover:text-primary"
      >
        <FileText className="size-3.5" />
      </button>
    </div>
  );
}
