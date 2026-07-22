import { AnimatePresence, motion } from "motion/react";
import { Pencil, ImageUp, Trash2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onRename: () => void;
  onReplaceImage: () => void;
  onDelete: () => void;
};

const positions = [
  { x: 0, y: -42 },
  { x: -38, y: 14 },
  { x: 38, y: 14 },
];

export function RadialMenu({ open, onClose, onRename, onReplaceImage, onDelete }: Props) {
  const actions = [
    { icon: Pencil, label: "Rename", run: onRename, className: "bg-primary text-primary-foreground" },
    { icon: ImageUp, label: "Replace", run: onReplaceImage, className: "bg-secondary text-secondary-foreground" },
    { icon: Trash2, label: "Delete", run: onDelete, className: "bg-destructive text-destructive-foreground" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-background/70 backdrop-blur-sm"
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            const pos = positions[index]!;
            return (
              <motion.button
                key={action.label}
                type="button"
                aria-label={action.label}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ scale: 1, x: pos.x, y: pos.y }}
                exit={{ scale: 0, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 24, delay: index * 0.03 }}
                onClick={(event) => {
                  event.stopPropagation();
                  action.run();
                  onClose();
                }}
                className={`absolute grid size-9 place-items-center rounded-full shadow-md ${action.className}`}
              >
                <Icon className="size-4" />
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
