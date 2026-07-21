import { useEffect, useState } from "react";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_/";

export function TextScramble({ text, className }: { text: string; className?: string }) {
  const { reduced } = useMotionSettings();
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    let raf = 0;
    const total = text.length * 3;
    const tick = () => {
      const revealed = Math.floor(frame / 3);
      const scrambled = text
        .split("")
        .map((char, index) => {
          if (index < revealed || char === " ") return char;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setDisplay(scrambled);
      frame += 1;
      if (frame <= total) raf = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, reduced]);

  return <span className={className}>{reduced ? text : display}</span>;
}
