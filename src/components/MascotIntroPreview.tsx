import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { MascotIntroThreeSceneV2 } from "./MascotIntroThreeSceneV2";

const sequenceDuration = 5800;

export function MascotIntroPreview() {
  const [runId, setRunId] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setComplete(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setComplete(true), reduced ? 120 : sequenceDuration);
    return () => window.clearTimeout(timer);
  }, [runId]);

  const replay = () => setRunId((value) => value + 1);

  return (
    <main className={`mascot-intro-preview ${complete ? "is-complete" : "is-playing"}`}>
      <section className="mascot-intro-stage" aria-label="Three.js mascot intro prototype">
        <MascotIntroThreeSceneV2 key={runId} runId={runId} />
        <div className="mascot-intro-grain" aria-hidden="true" />

        <motion.div
          key={`wordmark-${runId}`}
          className="mascot-intro-wordmark"
          initial={{ y: "-72vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            y: { delay: 3.25, duration: 1.28, ease: [0.2, 0.86, 0.27, 1.08] },
            opacity: { delay: 3.2, duration: 0.24 },
          }}
        >
          <motion.span
            className="mascot-intro-tether"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 1, 0] }}
            transition={{ delay: 3.2, duration: 1.75, times: [0, 0.35, 0.72, 1], ease: "easeInOut" }}
            aria-hidden="true"
          />
          <motion.h1
            animate={{ y: [0, 7, -3, 0] }}
            transition={{ delay: 4.15, duration: 0.72, ease: "easeOut" }}
          >
            <span>Sell</span> <em>with</em>
            <strong>DVC For Less</strong>
          </motion.h1>
        </motion.div>

        <motion.p
          key={`subtitle-${runId}`}
          className="mascot-intro-subtitle"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.72, duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
        >
          The place DVC Buyers start is now the best place to sell.
        </motion.p>

        <AnimatePresence>
          {complete && (
            <motion.div
              className="mascot-intro-actions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <button type="button" onClick={replay}>
                <span aria-hidden="true">↻</span> Replay intro
              </button>
              <a href="/">Back to current website</a>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mascot-intro-note">
          <span>Three.js intro study</span>
          <i>{complete ? "Final hero state" : "Playing sequence"}</i>
        </div>
      </section>
    </main>
  );
}
