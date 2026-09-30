import { useState } from "react";

const groups = [
  {
    id: "T",
    eyebrow: "Selected direction 01",
    title: "Cool Taupe",
    note: "A progression from airy cool grey to deeper cocoa taupe, always retaining a clear greige belly contrast.",
    options: [
      ["T1", "Light cool greige", "Airy taupe", "owl-refine-t1-light-greige.png"],
      ["T2", "Balanced mushroom", "10 translucent balloons", "owl-final-balanced-mushroom-10-translucent-balloons.png"],
      ["T3", "Deep cocoa greige", "Rich taupe", "owl-refine-t3-deep-cocoa-greige.png"],
    ],
  },
  {
    id: "B",
    eyebrow: "Selected direction 02",
    title: "Soft Black & Cream",
    note: "Three softer charcoal directions that retain the cream belly contrast without using absolute black.",
    options: [
      ["B1", "Soft charcoal", "Charcoal cream", "owl-refine-b1-charcoal-cream.png"],
      ["B2", "Cool blue ink", "Blue-ink cream", "owl-refine-b2-blue-ink-cream.png"],
      ["B3", "Smoky espresso", "Espresso cream", "owl-refine-b3-smoky-espresso-cream.png"],
    ],
  },
  {
    id: "S",
    eyebrow: "Selected direction 03",
    title: "Sage Green",
    note: "Three low-saturation grey-green directions with distinct belly values for a friendly but mature contrast.",
    options: [
      ["S1", "Light eucalyptus", "Pale sage", "owl-refine-s1-light-eucalyptus.png"],
      ["S2", "Natural sage", "Balanced green", "owl-refine-s2-natural-sage.png"],
      ["S3", "Deep forest sage", "Deep green", "owl-refine-s3-deep-forest-sage.png"],
    ],
  },
] as const;

type Option = (typeof groups)[number]["options"][number];

export function OwlRefinementGallery() {
  const [selected, setSelected] = useState<Option | null>(null);

  return (
    <main className="owl-gallery owl-refinement-gallery">
      <header className="owl-gallery-header">
        <div>
          <p>Original owl · focused refinement</p>
          <h1>9 close variations</h1>
          <span>The original owl is preserved while the three selected color directions are compared.</span>
        </div>
        <a href="/?preview=owl-colorways&v=2">Back to 20 colors</a>
      </header>

      {groups.map((group) => (
        <section className="owl-refinement-group" key={group.id}>
          <header className="owl-refinement-heading">
            <p>{group.eyebrow}</p>
            <h2>{group.title}</h2>
            <span>{group.note}</span>
          </header>
          <div className="owl-gallery-grid owl-refinement-grid">
            {group.options.map((option) => {
              const [number, name, descriptor, file] = option;
              const isSelected = selected?.[0] === number;
              return (
                <button
                  key={number}
                  type="button"
                  className={`owl-gallery-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => setSelected(isSelected ? null : option)}
                  aria-pressed={isSelected}
                >
                  <div className="owl-gallery-image-wrap">
                    <img src={`/assets/${file}`} alt={`${number} ${name} owl colorway`} loading="lazy" />
                  </div>
                  <span className="owl-gallery-number">{number}</span>
                  <span className="owl-gallery-name"><strong>{name}</strong>{descriptor}</span>
                  <i aria-hidden="true">{isSelected ? "Selected" : "Select"}</i>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {selected && (
        <aside className="owl-gallery-selection" aria-live="polite">
          <span>Your selection</span>
          <strong>{selected[0]} · {selected[1]}</strong>
          <button type="button" onClick={() => setSelected(null)} aria-label="Clear selection">×</button>
        </aside>
      )}
    </main>
  );
}
