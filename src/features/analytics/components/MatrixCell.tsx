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
        {status === "done" && (
          <span className="grid size-5 place-items-center rounded-full bg-success/20">
            <Check className="size-3 text-success" />
          </span>
        )}
        {status === "missed" && (
          <span className="grid size-5 place-items-center rounded-full bg-destructive/20">
            <X className="size-3 text-destructive" />
          </span>
        )}
        {!status && (
          <span className="size-1.5 rounded-full bg-border" />
        )}
      </div>
    );
  }

  const entry = record?.valueEntries[row.id];
  if (entry === undefined) {
    return (
      <div className={base} style={{ height }}>
        <span className="size-1.5 rounded-full bg-border" />
      </div>
    );
  }

  if (row.valueType === "numeric") {
    return (
      <div className={base} style={{ height }}>
        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-primary">
          {String(entry)}
        </span>
      </div>
    );
  }

  return (
    <div className={base} style={{ height }}>
      <button
        type="button"
        aria-label="View note"
        onClick={() => onOpenText(row.name, String(entry))}
        className="grid size-5 place-items-center rounded-full bg-primary/15 text-primary hover:bg-primary/25"
      >
        <FileText className="size-3" />
      </button>
    </div>
  );
}
