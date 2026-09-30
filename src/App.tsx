import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CalculatorBar } from "./components/CalculatorBar";
import { CloudScene } from "./components/CloudScene";
import { ContentSections } from "./components/ContentSections";
import { MascotIntroOverlay } from "./components/MascotIntroOverlay";
import { ResultDrawer } from "./components/ResultDrawer";
import { SmoothScroll } from "./components/SmoothScroll";
import type { EstimateData } from "./types";

export default function App() {
  const heroRef = useRef<HTMLElement>(null);
  const calculatorAnchorRef = useRef<HTMLDivElement>(null);
  const estimateOriginRef = useRef(0);
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [lastEstimate, setLastEstimate] = useState<EstimateData | null>(null);
  const [hasEstimated, setHasEstimated] = useState(false);
  const [calculatorDocked, setCalculatorDocked] = useState(false);
  const [anchorTop, setAnchorTop] = useState(0);
  const [anchorWidth, setAnchorWidth] = useState(1106);
  const [showMascotIntro, setShowMascotIntro] = useState(true);
  const completeMascotIntro = useCallback(() => setShowMascotIntro(false), []);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const anchor = calculatorAnchorRef.current?.getBoundingClientRect();
        if (!anchor) return;
        setCalculatorDocked((isDocked) => isDocked ? anchor.top <= 30 : anchor.top <= 18);
        setAnchorTop(anchor.top);
        setAnchorWidth(anchor.width);
      });
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    if (calculatorAnchorRef.current) observer.observe(calculatorAnchorRef.current);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const showEstimate = (data: EstimateData) => {
    estimateOriginRef.current = window.scrollY;
    setEstimate(data);
    setLastEstimate(data);
    setHasEstimated(true);
  };

  const openCalculatorAtCurrentSection = useCallback(() => {
    window.dispatchEvent(new CustomEvent("dvc:open-calculator", { detail: { step: "resort" } }));
  }, []);

  const continueWithEstimate = useCallback(() => {
    if (!lastEstimate) {
      openCalculatorAtCurrentSection();
      return;
    }
    estimateOriginRef.current = window.scrollY;
    setEstimate(lastEstimate);
  }, [lastEstimate, openCalculatorAtCurrentSection]);

  const editEstimate = (direction: "back" | "forward" = "back") => {
    setEstimate(null);
    if (direction === "forward") {
      window.setTimeout(() => {
        window.scrollTo({
          top: estimateOriginRef.current + Math.min(window.innerHeight * 0.82, 720),
          behavior: "smooth",
        });
      }, 220);
    }
  };

  const editEstimateDetails = useCallback(() => {
    setEstimate(null);
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("dvc:open-calculator", { detail: { step: "resort" } }));
    }, 220);
  }, []);

  return (
    <>
      <SmoothScroll />
      <AnimatePresence>
        {showMascotIntro && <MascotIntroOverlay onComplete={completeMascotIntro} />}
      </AnimatePresence>
      <section className={`hero-scroll ${showMascotIntro ? "is-intro-active" : "is-intro-complete"}`} ref={heroRef}>
        <div className="hero-sticky">
          <CloudScene scrollRoot={heroRef} />
          <div className="sky-grain" />

          <nav className="nav-bar" aria-label="Primary navigation">
            <a className="brand" href="#top" aria-label="DVC For Less home">
              <img src="/assets/dvc-logo.svg" alt="DVC For Less" />
            </a>
            <button type="button" className="login-button">
              Login
              <span><img src="/assets/login-icon.svg" alt="" /></span>
            </button>
          </nav>

          <main className="hero-content" id="top">
            <div className="hero-copy">
              <h1><span>Sell</span> <em>with</em><br />DVC For Less</h1>
              <p>The place DVC Buyers start is now the best place to sell.</p>
            </div>
            <div className="calculator-anchor" ref={calculatorAnchorRef} aria-hidden="true" />
            <p className="instant-copy">Get an instant, accurate valuation in 2 seconds!</p>
          </main>

          <div className="advisor-pill">
            <div className="advisor-person">
              <img src="/assets/advisor.png" alt="DVC specialist" />
              <span>Prefer to talk first?</span>
            </div>
            <p>Call <a href="tel:+18333823326">(833) 382-3326</a><br />to speak with our specialist.</p>
          </div>

        </div>
      </section>

      <motion.div
        className={`calculator-dock ${calculatorDocked ? "is-docked" : "is-hero"} ${showMascotIntro ? "is-intro-active" : "is-intro-complete"} ${estimate ? "is-result-open" : ""}`}
        initial={false}
        animate={{
          top: calculatorDocked ? 14 : Math.max(14, anchorTop),
          width: calculatorDocked ? "min(1106px, calc(100vw - 48px))" : anchorWidth,
          opacity: showMascotIntro || estimate ? 0 : 1,
        }}
        transition={{
          top: { duration: 0.14, ease: [0.22, 1, 0.36, 1] },
          width: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.55, ease: "easeOut" },
        }}
      >
        <CalculatorBar
          mode={calculatorDocked ? "sticky" : "hero"}
          hasEstimate={hasEstimated}
          onEstimate={showEstimate}
        />
      </motion.div>

      <AnimatePresence initial={false}>
        {estimate && <ResultDrawer data={estimate} onClose={editEstimate} onEdit={editEstimateDetails} />}
      </AnimatePresence>
      <ContentSections
        hasEstimate={hasEstimated}
        onOpenCalculator={openCalculatorAtCurrentSection}
        onContinueEstimate={continueWithEstimate}
      />
    </>
  );
}
