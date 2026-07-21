import { useState } from "react";
import { cn } from "@/lib/cn";
import { Input } from "@/common/components/ui/form/input";

type Props = {
  value: string;
  editMode: boolean;
  onRename: (value: string) => void;
  className?: string;
};

export function EditableTitle({ value, editMode, onRename, className }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  const commit = () => {
    const trimmed = text.trim();
    onRename(trimmed || value);
    setEditing(false);
  };

  if (editMode && editing) {
    return (
      <Input
        autoFocus
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") setEditing(false);
        }}
        className="h-8 w-48"
      />
    );
  }

  if (!editMode) return <span className={className}>{value}</span>;

  return (
    <button
      type="button"
      onClick={() => {
        setText(value);
        setEditing(true);
      }}
      className={cn("text-left hover:text-primary", className)}
    >
      {value}
    </button>
  );
}
