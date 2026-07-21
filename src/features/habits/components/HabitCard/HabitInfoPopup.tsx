import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { springs } from "@/lib/motionTokens";

type Props = {
  open: boolean;
  title: string;
  details: string;
  onClose: () => void;
};

/**
 * A small informational popup shown when the user taps a habit card's title.
 *
 * Card titles are clamped to two lines in a narrow column, so the full name is
 * often truncated. Tapping the text surfaces the complete name plus any details
 * in a centered card, without triggering the tick/cross gestures.
 */
export function HabitInfoPopup({ open, title, details, onClose }: Props) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 grid place-items-center bg-background/60 p-6 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={springs.snappy}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xs rounded-2xl border border-gray-100 bg-white p-5 shadow-xl dark:border-border dark:bg-card"
          >
            <h3 className="text-base font-bold leading-snug text-black dark:text-foreground">
              {title}
            </h3>
            {details.trim() ? (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-muted-foreground">
                {details}
              </p>
            ) : (
              <p className="mt-2 text-sm italic text-gray-400 dark:text-muted-foreground">
                No details added.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
