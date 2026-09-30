import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { EstimateData } from "../types";

type ResultDrawerProps = {
  data: EstimateData;
  onClose: (direction?: "back" | "forward") => void;
  onEdit: () => void;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ResultDrawer({ data, onClose, onEdit }: ResultDrawerProps) {
  const sheetRef = useRef<HTMLElement>(null);
  const touchStartY = useRef(0);
  const [exitDirection, setExitDirection] = useState<"back" | "forward">("back");
  const recommended = useMemo(() => Math.round((data.contractPoints * 100 + 200) / 100) * 100, [data.contractPoints]);
  const low = recommended - 200;
  const high = recommended + 200;
  const spectrumMin = recommended - 2600;
  const spectrumMax = recommended + 2800;
  const [listingPrice, setListingPrice] = useState(recommended);

  const pricePosition = ((listingPrice - spectrumMin) / (spectrumMax - spectrumMin)) * 100;
  const recommendedStart = ((low - spectrumMin) / (spectrumMax - spectrumMin)) * 100;
  const recommendedWidth = ((high - low) / (spectrumMax - spectrumMin)) * 100;
  const priceState = listingPrice < low ? "low" : listingPrice > high ? "high" : "recommended";
  const priceMessage = priceState === "low"
    ? { title: "Below the recommended range", description: "Priced to move, but may leave money on the table." }
    : priceState === "high"
      ? { title: "Above the recommended range", description: "A higher asking price may take longer to find the right buyer." }
      : { title: "Within the recommended range", description: "Balances expected sale price with time on the market." };

  const dismiss = (direction: "back" | "forward") => {
    setExitDirection(direction);
    requestAnimationFrame(() => onClose(direction));
  };

  const handleWheel = (event: React.WheelEvent<HTMLElement>) => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const atTop = sheet.scrollTop <= 1;
    const atBottom = sheet.scrollTop + sheet.clientHeight >= sheet.scrollHeight - 2;
    if (atTop && event.deltaY < -18) {
      event.preventDefault();
      dismiss("back");
    } else if (atBottom && event.deltaY > 18) {
      event.preventDefault();
      dismiss("forward");
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLElement>) => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const delta = event.touches[0].clientY - touchStartY.current;
    const atTop = sheet.scrollTop <= 1;
    const atBottom = sheet.scrollTop + sheet.clientHeight >= sheet.scrollHeight - 2;
    if (atTop && delta > 48) dismiss("back");
    else if (atBottom && delta < -48) dismiss("forward");
  };

  return (
    <motion.div className="result-overlay" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 1 }}>
      <motion.section
        className="result-drawer result-section"
        data-lenis-prevent
        ref={sheetRef}
        aria-labelledby="result-title"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: exitDirection === "forward" ? "-100%" : "100%" }}
        transition={{ type: "spring", stiffness: 230, damping: 30, mass: 0.88 }}
        onWheel={handleWheel}
        onTouchStart={(event) => { touchStartY.current = event.touches[0].clientY; }}
        onTouchMove={handleTouchMove}
      >
        <div className="result-glow result-glow-lime" />
        <div className="result-glow result-glow-blue" />

        <header className="result-header">
          <div className="contract-summary">
            <img src={data.resort.image} alt="" />
            <strong>{data.resort.name}</strong>
            <span className="summary-chip"><img src="/assets/points-icon.svg" alt="" /> {data.contractPoints}</span>
            <div className="year-summary">
              {Object.entries(data.pointsByYear).map(([year, points]) => (
                <span key={year}><strong>{points}</strong><small>{year}</small></span>
              ))}
            </div>
            <span className="use-year-summary"><small>Use Year</small>{data.useYear}</span>
          </div>
          <button type="button" className="edit-button" onClick={onEdit}>
            Edit
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l10.6-10.6a2.1 2.1 0 0 0-4-3L4 17v3Z" /><path d="m13.6 7.4 3 3" /></svg>
          </button>
        </header>

        <div className="result-content">
          <main className="result-main">
            <section className="estimate-card">
              <h1 id="result-title">Here’s what your contract could sell for:</h1>
              <p className="estimate-range">{money.format(low)} – {money.format(high)}</p>
              <div className="recommended-price">
                <span>Recommended listing price:</span>
                <strong>{money.format(recommended)}</strong>
                <span className="price-per-point">$115 / pt <img src="/assets/per-point-icon.svg" alt="" /></span>
              </div>
            </section>

            <section className="range-card">
              <div className="recommendation-copy">
                <h2>What this recommendation is based on</h2>
                <p>Compared against 6 live {data.resort.name} listings — recent sellers at this resort, across all contract sizes, found a buyer after a median of 12 days on the market.</p>
              </div>
              <div
                className={`price-calculator is-${priceState}`}
                style={{
                  "--price-position": `${pricePosition}%`,
                  "--recommended-start": `${recommendedStart}%`,
                  "--recommended-width": `${recommendedWidth}%`,
                } as CSSProperties}
              >
                <div className="price-spectrum">
                  <span>{money.format(spectrumMin)}</span>
                  <span>{money.format(spectrumMax)}</span>
                  <i className="recommended-zone" aria-hidden="true" />
                  <input
                    type="range"
                    min={spectrumMin}
                    max={spectrumMax}
                    step="100"
                    value={listingPrice}
                    onChange={(event) => setListingPrice(Number(event.target.value))}
                    aria-label="Preferred listing price"
                  />
                </div>
                <output className="price-feedback">
                  <strong>{money.format(listingPrice)}</strong>
                  <span>{priceMessage.title} <img src="/assets/smile-icon.svg" alt="" /></span>
                  <p>{priceMessage.description}</p>
                </output>
              </div>
            </section>
          </main>

          <aside className="result-aside">
            <h2>Let’s take a closer look at your ownership.</h2>
            <p>Share the remaining details about your ownership. A DVC For Less specialist will review your contract and contact you to discuss the price, timing, and what you want the sale to accomplish.</p>
            <button type="button">Continue With My Estimate <span>→</span></button>
          </aside>
        </div>
      </motion.section>
    </motion.div>
  );
}
