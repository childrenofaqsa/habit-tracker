import { AnimatePresence, motion } from "motion/react";
import { Info } from "lucide-react";
import { springs } from "@/lib/motionTokens";
import { useAppStore } from "@/store/useAppStore";

export function EditModeBanner() {
  const editMode = useAppStore((state) => state.settings.editMode);

  return (
    <AnimatePresence initial={false}>
      {editMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={springs.gentle}
          className="overflow-hidden bg-primary/10 text-primary"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-sm">
            <Info className="size-4 shrink-0" />
            <span>Edit Mode — tap items to rename, icons to delete, drag to reorder.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
