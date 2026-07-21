import { cn } from "@/lib/cn";
import { FieldNamesTab } from "./FieldNamesTab";
import { EntityTab } from "./EntityTab";

export type FieldSubTab = "names" | "entity";

type Props = {
  subTab: FieldSubTab;
  onSubTabChange: (tab: FieldSubTab) => void;
  createNonce: number;
};

const SUB_TABS: { id: FieldSubTab; label: string }[] = [
  { id: "names", label: "Field names" },
  { id: "entity", label: "Entity" },
];

export function FieldTab({ subTab, onSubTabChange, createNonce }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex gap-6 border-b border-border">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSubTabChange(tab.id)}
            className={cn(
              "-mb-px border-b-2 pb-2 text-sm font-medium transition-colors",
              subTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === "names" ? (
        <FieldNamesTab createNonce={createNonce} />
      ) : (
        <EntityTab createNonce={createNonce} />
      )}
    </div>
  );
}
