import { useMemo, useState } from "react";
import { Gauge, Plus } from "lucide-react";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { selectValues } from "@/store/selectors";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/common/components/EmptyState";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { ValueRow } from "@/features/values/components/ValueRow";
import { EditUpdatePage } from "@/features/values/components/EditUpdatePage";
import { CreateTrackerPage } from "@/features/values/components/CreateTrackerPage";
import { TrackerDetailView } from "@/features/values/components/TrackerDetailView";
import { FieldTab, type FieldSubTab } from "@/features/fields/components/FieldTab";

type ValuesScreen =
  | { type: "home" }
  | { type: "create" }
  | { type: "edit"; valueId: string }
  | { type: "detail"; valueId: string };

type TopTab = "updates" | "fields";

const TOP_TABS: { id: TopTab; label: string }[] = [
  { id: "updates", label: "Tracker Updates" },
  { id: "fields", label: "Field" },
];

export function ValuesView() {
  const [screen, setScreen] = useState<ValuesScreen>({ type: "home" });
  const [tab, setTab] = useState<TopTab>("updates");
  const [fieldSubTab, setFieldSubTab] = useState<FieldSubTab>("names");
  const [createNonce, setCreateNonce] = useState(0);
  const values = useAppStore(useShallow(selectValues));
  const reorderValues = useAppStore((s) => s.reorderValues);
  const searchQuery = useUiStore((s) => s.searchQuery);

  const filteredValues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return values;
    return values.filter(
      (v) =>
        v.name.toLowerCase().includes(q) || v.unit.toLowerCase().includes(q),
    );
  }, [values, searchQuery]);

  if (screen.type === "create") {
    return <CreateTrackerPage onBack={() => setScreen({ type: "home" })} />;
  }

  if (screen.type === "edit") {
    const value = values.find((v) => v.id === screen.valueId);
    if (!value) return <div />;
    return <EditUpdatePage value={value} onBack={() => setScreen({ type: "home" })} />;
  }

  if (screen.type === "detail") {
    const value = values.find((v) => v.id === screen.valueId);
    if (!value) return <div />;
    return <TrackerDetailView value={value} onBack={() => setScreen({ type: "home" })} />;
  }

  function handleCreate() {
    if (tab === "updates") setScreen({ type: "create" });
    else setCreateNonce((n) => n + 1);
  }

  const dragEnabled = !searchQuery.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          {TOP_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "text-2xl font-bold transition-colors",
                tab === item.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> Create New
        </button>
      </div>

      {tab === "fields" ? (
        <FieldTab
          subTab={fieldSubTab}
          onSubTabChange={setFieldSubTab}
          createNonce={createNonce}
        />
      ) : values.length === 0 ? (
        <EmptyState
          icon={Gauge}
          title="No trackers yet"
          description="Create your first tracker to start recording daily progress."
        />
      ) : dragEnabled ? (
        <DndList
          ids={filteredValues.map((v) => v.id)}
          strategy={verticalListSortingStrategy}
          onReorder={reorderValues}
          mode="longpress"
        >
          <div className="space-y-4">
            {filteredValues.map((value) => (
              <Sortable key={value.id} id={value.id}>
                {({ attributes, listeners, isDragging }) => (
                  <div
                    {...attributes}
                    {...listeners}
                    className={cn(
                      "touch-none select-none",
                      isDragging && "cursor-grabbing",
                    )}
                  >
                    <ValueRow
                      value={value}
                      onNameClick={() => setScreen({ type: "edit", valueId: value.id })}
                      onLogClick={() => setScreen({ type: "detail", valueId: value.id })}
                    />
                  </div>
                )}
              </Sortable>
            ))}
          </div>
        </DndList>
      ) : filteredValues.length === 0 ? (
        <EmptyState
          icon={Gauge}
          title="No trackers found"
          description={`No trackers match "${searchQuery.trim()}".`}
        />
      ) : (
        <div className="space-y-4">
          {filteredValues.map((value) => (
            <ValueRow
              key={value.id}
              value={value}
              onNameClick={() => setScreen({ type: "edit", valueId: value.id })}
              onLogClick={() => setScreen({ type: "detail", valueId: value.id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
