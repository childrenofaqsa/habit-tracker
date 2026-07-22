import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, type ButtonProps } from "@/common/components/ui/data/button";
import { Input } from "@/common/components/ui/form/input";

type Props = {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
};

export function AddInline({ label, placeholder, onAdd, variant = "outline", size }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const submit = () => {
    const trimmed = text.trim();
    if (trimmed) onAdd(trimmed);
    setText("");
    setOpen(false);
  };

  if (!open) {
    return (
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <Plus className="size-4" /> {label}
      </Button>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Input
        autoFocus
        value={text}
        placeholder={placeholder}
        onBlur={submit}
        onChange={(event) => setText(event.target.value)}
        className="h-9 w-44"
      />
    </form>
  );
}
