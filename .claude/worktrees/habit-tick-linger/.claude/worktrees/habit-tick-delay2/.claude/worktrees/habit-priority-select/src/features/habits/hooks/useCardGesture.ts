import { useRef } from "react";
import { LONG_PRESS_MS } from "@/lib/constants";

type GestureOptions = {
  enabled: boolean;
  onTap: () => void;
  onLongPress: () => void;
  onDoubleTap?: () => void;
};

const MOVE_THRESHOLD = 10;
const DOUBLE_TAP_MS = 280;

export function useCardGesture({
  enabled,
  onTap,
  onLongPress,
  onDoubleTap,
}: GestureOptions) {
  const timer = useRef<number | null>(null);
  const longFired = useRef(false);
  const moved = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const lastTap = useRef(0);

  const clearTimer = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (!enabled) return;
    longFired.current = false;
    moved.current = false;
    start.current = { x: event.clientX, y: event.clientY };
    timer.current = window.setTimeout(() => {
      longFired.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!enabled || timer.current === null) return;
    const dx = Math.abs(event.clientX - start.current.x);
    const dy = Math.abs(event.clientY - start.current.y);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      moved.current = true;
      clearTimer();
    }
  };

  const onPointerUp = () => {
    if (!enabled) return;
    clearTimer();
    if (longFired.current || moved.current) return;
    const now = Date.now();
    if (onDoubleTap && now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      onDoubleTap();
      return;
    }
    lastTap.current = now;
    onTap();
  };

  const onPointerCancel = () => clearTimer();

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
