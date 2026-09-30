import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { EstimateData, Resort } from "../types";

type CalculatorBarProps = {
  mode: "hero" | "sticky";
  hasEstimate: boolean;
  onEstimate: (data: EstimateData) => void;
};

type Step = "resort" | "points" | "year";

const resorts: Resort[] = [
  { name: "Animal Kingdom Villas", shortName: "Animal Kingdom", image: "/assets/resort-animal-kingdom.png" },
  { name: "Aulani, Disney Vacation Club Villas", shortName: "Aulani", image: "/assets/resort-polynesian.png" },
  { name: "Bay Lake Tower", shortName: "Bay Lake Tower", image: "/assets/resort-bay-lake.png" },
  { name: "Beach Club Villas", shortName: "Beach Club", image: "/assets/resort-grand-californian.png" },
  { name: "BoardWalk Villas", shortName: "BoardWalk", image: "/assets/resort-saratoga.png" },
  { name: "Boulder Ridge Villas", shortName: "Boulder Ridge", image: "/assets/resort-boulder-ridge.png" },
  { name: "Cabins at Disney's Fort Wilderness Resort", shortName: "Fort Wilderness", image: "/assets/resort-boulder-ridge.png" },
  { name: "Copper Creek Villas & Cabins", shortName: "Copper Creek", image: "/assets/resort-boulder-ridge.png" },
  { name: "Disneyland Hotel Villas", shortName: "Disneyland Hotel", image: "/assets/resort-grand-californian.png" },
  { name: "Grand Californian Villas", shortName: "Grand Californian", image: "/assets/resort-grand-californian.png" },
  { name: "Grand Floridian Villas", shortName: "Grand Floridian", image: "/assets/resort-bay-lake.png" },
  { name: "Hilton Head Island Resort", shortName: "Hilton Head", image: "/assets/resort-saratoga.png" },
  { name: "Old Key West Resort", shortName: "Old Key West", image: "/assets/resort-saratoga.png" },
  { name: "Polynesian Villas & Bungalows", shortName: "Polynesian", image: "/assets/resort-polynesian.png" },
  { name: "Riviera Resort", shortName: "Riviera", image: "/assets/resort-grand-californian.png" },
  { name: "Saratoga Springs", shortName: "Saratoga Springs", image: "/assets/resort-saratoga.png" },
  { name: "Vero Beach Resort", shortName: "Vero Beach", image: "/assets/resort-polynesian.png" },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const panelMotion = {
  initial: { opacity: 0, y: -8, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.985 },
  transition: { type: "spring" as const, stiffness: 420, damping: 32 },
};

export function CalculatorBar({ mode, hasEstimate, onEstimate }: CalculatorBarProps) {
  const [activeStep, setActiveStep] = useState<Step | null>(null);
  const [resort, setResort] = useState<Resort | null>(null);
  const [contractPoints, setContractPoints] = useState(0);
  const [pointsByYear, setPointsByYear] = useState<Record<string, number>>({
    "2026": 0,
    "2027": 0,
    "2028": 0,
  });
  const [useYear, setUseYear] = useState("");
  const [panelLeft, setPanelLeft] = useState(16);
  const [panelTop, setPanelTop] = useState(0);
  const [panelMaxHeight, setPanelMaxHeight] = useState(520);
  const [stickyExpanded, setStickyExpanded] = useState(false);
  const [ctaNudging, setCtaNudging] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const nudgeTimerRef = useRef(0);
  const fieldRefs = useRef<Record<Step, HTMLButtonElement | null>>({
    resort: null,
    points: null,
    year: null,
  });

  useEffect(() => {
    const handleOutside = (event: PointerEvent) => {
      if (shellRef.current && !shellRef.current.contains(event.target as Node)) {
        setActiveStep(null);
        if (mode === "sticky") setStickyExpanded(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveStep(null);
    };
    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mode]);

  useEffect(() => {
    if (mode === "hero") {
      setStickyExpanded(false);
      return;
    }

    const collapseOnScroll = () => {
      setActiveStep(null);
      setStickyExpanded(false);
    };
    window.addEventListener("scroll", collapseOnScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", collapseOnScroll);
    };
  }, [mode]);

  const positionPanel = (step: Step) => {
    const shell = shellRef.current?.getBoundingClientRect();
    const field = fieldRefs.current[step]?.getBoundingClientRect();
    if (!shell || !field) return;

    const panelWidth = step === "year" ? 430 : 620;
    const desiredLeft = field.left - shell.left - (step === "year" ? 12 : 0);
    const panelScreenTop = window.innerWidth <= 620 ? field.bottom + 4 : shell.bottom + 4;
    setPanelLeft(Math.max(16, Math.min(desiredLeft, shell.width - panelWidth - 16)));
    setPanelTop(field.bottom - shell.top + 4);
    setPanelMaxHeight(Math.max(180, window.innerHeight - panelScreenTop - 12));
  };

  const activateStep = (step: Step) => {
    if (step === "points" && contractPoints === 0) setContractPoints(150);
    if (mode === "sticky") setStickyExpanded(true);
    positionPanel(step);
    setActiveStep(step);
  };

  const openStep = (step: Step) => {
    if (activeStep === step) return setActiveStep(null);
    activateStep(step);
  };

  useEffect(() => {
    const openCalculator = (event: Event) => {
      if (mode !== "sticky") return;
      const requestedStep = (event as CustomEvent<{ step?: Step }>).detail?.step ?? "resort";
      setStickyExpanded(true);
      setActiveStep(null);
      window.requestAnimationFrame(() => {
        positionPanel(requestedStep);
        setActiveStep(requestedStep);
      });
    };

    window.addEventListener("dvc:open-calculator", openCalculator);
    return () => window.removeEventListener("dvc:open-calculator", openCalculator);
  }, [mode]);

  useEffect(() => () => window.clearTimeout(nudgeTimerRef.current), []);

  const updateContractPoints = (value: number) => {
    const safeValue = Math.min(500, Math.max(0, value));
    setContractPoints(safeValue);
  };

  const nudgeEstimateButton = () => {
    setCtaNudging(false);
    window.clearTimeout(nudgeTimerRef.current);
    window.requestAnimationFrame(() => {
      setCtaNudging(true);
      nudgeTimerRef.current = window.setTimeout(() => setCtaNudging(false), 1250);
    });
  };

  const submit = () => {
    if (!resort) return activateStep("resort");
    if (contractPoints <= 0) return activateStep("points");
    if (!useYear) return activateStep("year");
    setActiveStep(null);
    if (mode === "sticky") setStickyExpanded(false);
    onEstimate({ resort, contractPoints, pointsByYear, useYear });
  };

  const compact = mode === "sticky" && !stickyExpanded && activeStep === null;
  const estimateLabel = compact
    ? hasEstimate ? "Continue" : "Estimate"
    : mode === "sticky" && hasEstimate ? "Continue with My Estimate" : "Get My Estimate";

  return (
    <motion.div
      layout
      className={`calculator-wrap calculator-${mode} ${compact ? "is-compact" : "is-expanded"} ${ctaNudging ? "is-cta-nudging" : ""}`}
      ref={shellRef}
      transition={{ layout: { type: "spring", stiffness: 340, damping: 32 } }}
    >
      <div className="calculator-glass">
        <div className="calculator-bar" aria-label="DVC contract estimator">
          <div className="calculator-fields">
            <button
              ref={(node) => { fieldRefs.current.resort = node; }}
              type="button"
              className={`calculator-field ${activeStep === "resort" ? "is-active" : ""} ${resort ? "has-value" : ""}`}
              onClick={() => openStep("resort")}
              aria-expanded={activeStep === "resort"}
            >
              <span>Resort</span>
              <strong>{resort?.name ?? "Select Home Resort"}</strong>
            </button>
            <span className="field-divider" />
            <button
              ref={(node) => { fieldRefs.current.points = node; }}
              type="button"
              className={`calculator-field ${activeStep === "points" ? "is-active" : ""} ${contractPoints > 0 ? "has-value" : ""}`}
              onClick={() => openStep("points")}
              aria-expanded={activeStep === "points"}
            >
              <span>Points</span>
              <strong>{contractPoints > 0 ? `${contractPoints} Points` : "Add Points"}</strong>
            </button>
            <span className="field-divider" />
            <button
              ref={(node) => { fieldRefs.current.year = node; }}
              type="button"
              className={`calculator-field ${activeStep === "year" ? "is-active" : ""} ${useYear ? "has-value" : ""}`}
              onClick={() => openStep("year")}
              aria-expanded={activeStep === "year"}
            >
              <span>Use Year</span>
              <strong>{useYear || "Select Month"}</strong>
            </button>
          </div>
          <button type="button" className="estimate-button" onClick={submit}>
            {estimateLabel}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeStep === "resort" && (
          <motion.div className="calculator-panel resort-panel" key="resort" style={{ "--panel-left": `${panelLeft}px`, "--panel-top": `${panelTop}px`, "--panel-max-height": `${panelMaxHeight}px` } as CSSProperties} {...panelMotion}>
            <div className="panel-heading">
              <div>
                <h2>Disney Vacation Club Resorts</h2>
              </div>
            </div>
            <div className="resort-grid">
              {resorts.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  className={resort?.name === item.name ? "resort-option is-selected" : "resort-option"}
                  onClick={() => {
                    setResort(item);
                    if (contractPoints === 0) setContractPoints(150);
                    positionPanel("points");
                    setActiveStep("points");
                  }}
                >
                  <img src={item.image} alt="" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {activeStep === "points" && (
          <motion.div className="calculator-panel points-panel" key="points" style={{ "--panel-left": `${panelLeft}px`, "--panel-top": `${panelTop}px`, "--panel-max-height": `${panelMaxHeight}px` } as CSSProperties} {...panelMotion}>
            <div className="panel-heading">
              <div>
                <h2>How many points do you own?</h2>
              </div>
            </div>
            <div className="points-control">
              <label className="range-label" htmlFor="contract-points">Total Points on Contract</label>
              <div className="points-control-row">
                <div
                  className="points-slider-shell"
                  style={{ "--slider-progress": `${(contractPoints / 500) * 100}%` } as CSSProperties}
                >
                  <input
                    id="contract-points"
                    type="range"
                    min="0"
                    max="500"
                    step="1"
                    value={contractPoints}
                    onChange={(event) => updateContractPoints(Number(event.target.value))}
                  />
                  <span className="points-slider-thumb" aria-hidden="true"><i /><i /></span>
                </div>
                <label className="points-total">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={contractPoints}
                    aria-label="Total contract points"
                    onChange={(event) => updateContractPoints(Number(event.target.value))}
                  />
                  <span>points</span>
                </label>
              </div>
            </div>
            <div className="panel-rule" />
            <p className="input-section-label">Points available by year</p>
            <div className="year-inputs">
              {Object.entries(pointsByYear).map(([year, value]) => (
                <label key={year}>
                  <span>{year}</span>
                  <input
                    type="number"
                    min="0"
                    max="2000"
                    value={value}
                    onChange={(event) => setPointsByYear((current) => ({ ...current, [year]: Number(event.target.value) }))}
                  />
                </label>
              ))}
            </div>
            <button type="button" className="confirm-button" onClick={() => activateStep("year")}>
              Confirm
            </button>
          </motion.div>
        )}

        {activeStep === "year" && (
          <motion.div className="calculator-panel month-panel" key="year" style={{ "--panel-left": `${panelLeft}px`, "--panel-top": `${panelTop}px`, "--panel-max-height": `${panelMaxHeight}px` } as CSSProperties} {...panelMotion}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Use year</span>
                <h2>When does your use year begin?</h2>
              </div>
            </div>
            <div className="month-grid">
              {months.map((month) => (
                <button
                  type="button"
                  key={month}
                  className={useYear === month ? "is-selected" : ""}
                  onClick={() => {
                    setUseYear(month);
                    setActiveStep(null);
                    nudgeEstimateButton();
                  }}
                >
                  {month}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
