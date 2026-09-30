import { motion } from "motion/react";
import { useEffect } from "react";
import { MascotIntroThreeSceneV2 } from "./MascotIntroThreeSceneV2";

type Props = { onComplete: () => void };

export function MascotIntroOverlay({ onComplete }: Props) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(onComplete, reduced ? 120 : 1700);
    return () => {
      window.clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.section
      className="mascot-site-intro mascot-intro-stage"
      aria-label="DVC For Less mascot introduction"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      <MascotIntroThreeSceneV2 runId={0} />
    </motion.section>
  );
}
