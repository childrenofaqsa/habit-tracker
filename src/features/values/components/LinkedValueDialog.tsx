import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/common/components/ui/overlay/dialog";
import { Input } from "@/common/components/ui/form/input";
import { Textarea } from "@/common/components/ui/form/textarea";
import { Button } from "@/common/components/ui/data/button";
import type { ValueTracker } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";

function ValuePromptForm({
  value,
  onSave,
  onSkip,
}: {
  value: ValueTracker;
  onSave: (entry: number | string) => void;
  onSkip: () => void;
}) {
  const [draft, setDraft] = useState("");

  const handleSave = () => {
    const parsed = value.type === "numeric" ? Number(draft) : draft;
    if (value.type === "numeric" && Number.isNaN(parsed as number)) return;
    onSave(parsed);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{value.name}</DialogTitle>
        <DialogDescription>Log today's value for this linked habit.</DialogDescription>
      </DialogHeader>
      {value.type === "numeric" ? (
        <Input
          autoFocus
          type="number"
          inputMode="decimal"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      ) : (
        <Textarea
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      )}
      <DialogFooter>
        <Button variant="ghost" onClick={onSkip}>
          Skip
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogFooter>
    </>
  );
}

export function LinkedValueDialog() {
  const valuePromptId = useUiStore((state) => state.valuePromptId);
  const closeValuePrompt = useUiStore((state) => state.closeValuePrompt);
  const values = useAppStore((state) => state.values);
  const setValueEntryToday = useAppStore((state) => state.setValueEntryToday);
  const value = values.find((item) => item.id === valuePromptId) ?? null;

  return (
    <Dialog open={value !== null} onOpenChange={(open) => !open && closeValuePrompt()}>
      <DialogContent>
        {value && (
          <ValuePromptForm
            key={value.id}
            value={value}
            onSkip={closeValuePrompt}
            onSave={(entry) => {
              setValueEntryToday(value.id, entry);
              closeValuePrompt();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
