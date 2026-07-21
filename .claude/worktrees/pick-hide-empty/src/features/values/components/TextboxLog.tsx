import { useState } from "react";
import { NotebookPen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/common/components/ui/overlay/sheet";
import { Textarea } from "@/common/components/ui/form/textarea";
import { Button } from "@/common/components/ui/data/button";

type Props = { name: string; value: string; onChange: (next: string) => void };

export function TextboxLog({ name, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-12 w-full items-start gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm"
      >
        <NotebookPen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <span className="line-clamp-2 text-muted-foreground">
          {value || "Tap to write today's log"}
        </span>
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="space-y-4">
          <SheetHeader>
            <SheetTitle>{name}</SheetTitle>
            <SheetDescription>Log today's note.</SheetDescription>
          </SheetHeader>
          <Textarea
            autoFocus
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="min-h-40"
          />
          <Button className="w-full" onClick={() => setOpen(false)}>
            Done
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
}
