import { useState } from "react";

const colorways = [
  ["01", "Powder Blue", "Airy blue"],
  ["02", "Denim Blue", "Soft denim"],
  ["03", "Midnight Navy", "Deep navy"],
  ["04", "Deep Teal", "Dark teal"],
  ["05", "Aqua Turquoise", "Clear aqua"],
  ["06", "Seafoam Mint", "Pale mint"],
  ["07", "Sage Green", "Natural sage"],
  ["08", "Emerald Green", "Rich emerald"],
  ["09", "Butter Yellow", "Warm yellow"],
  ["10", "Citron Lime", "Bright lime"],
  ["11", "Warm Cream", "Soft cream"],
  ["12", "Silver Grey", "Cool silver"],
  ["13", "Graphite Charcoal", "Dark graphite"],
  ["14", "Black and Cream", "High contrast"],
  ["15", "Mushroom Taupe", "Balanced taupe"],
  ["16", "Soft Peach Apricot", "Warm peach"],
  ["17", "Cloud White and Blue", "Sky contrast"],
  ["18", "Cobalt and Citron", "Bold contrast"],
  ["19", "Peacock Navy and Teal", "Jewel tones"],
  ["20", "Soft Opalescent", "Subtle iridescence"],
] as const;

const slug = (name: string) => name.toLowerCase().replaceAll(" and ", "-").replaceAll(" ", "-");

export function OwlColorwayGallery() {
  const [selected, setSelected] = useState<(typeof colorways)[number] | null>(null);

  return (
    <main className="owl-gallery">
      <header className="owl-gallery-header">
        <div>
          <p>Original owl · color exploration</p>
          <h1>20 colorways</h1>
          <span>Same character, pose and balloon palette. Select any option to compare.</span>
        </div>
        <a href="/?preview=mascot-intro">Back to intro</a>
      </header>

      <section className="owl-gallery-grid" aria-label="Owl colorway options">
        {colorways.map((colorway) => {
          const [number, name, descriptor] = colorway;
          const isSelected = selected?.[0] === number;
          return (
            <button
              key={number}
              type="button"
              className={`owl-gallery-card ${isSelected ? "is-selected" : ""}`}
              onClick={() => setSelected(isSelected ? null : colorway)}
              aria-pressed={isSelected}
            >
              <div className="owl-gallery-image-wrap">
                <img
                  src={`/assets/owl-${number}-${slug(name)}.png`}
                  alt={`${number} ${name} owl colorway`}
                  loading="lazy"
                />
              </div>
              <span className="owl-gallery-number">{number}</span>
              <span className="owl-gallery-name"><strong>{name}</strong>{descriptor}</span>
              <i aria-hidden="true">{isSelected ? "Selected" : "Select"}</i>
            </button>
          );
        })}
      </section>

      {selected && (
        <aside className="owl-gallery-selection" aria-live="polite">
          <span>Your selection</span>
          <strong>{selected[0]} · {selected[2]}</strong>
          <button type="button" onClick={() => setSelected(null)} aria-label="Clear selection">×</button>
        </aside>
      )}
    </main>
  );
}
