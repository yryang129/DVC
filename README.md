# DVC For Less

An interactive Disney Vacation Club resale landing page and contract estimator built with React and TypeScript. The experience includes an animated owl introduction, a floating calculator, animated feature cards, cloud transitions, a selling journey, and seller FAQs.

## Project status

This is a front-end prototype. Estimate values and market comparisons currently use demonstration logic and sample content, rather than a live valuation service. Calculator inputs and the last estimate are held in memory and reset when the page reloads. Authentication, listing submission, and a persistent seller dashboard are not connected to a backend.

## Getting started

Install Node.js and npm, then run:

```sh
git clone https://github.com/yryang129/DVC.git
cd DVC
npm ci
npm run dev
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/) and keep the terminal process running while viewing the site.

`npm run dev` builds the application once and starts the local preview server. It does not watch source files or provide hot reload. After editing source files, run `npm run build` in another terminal and refresh the browser, or stop and restart `npm run dev`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies from the lockfile. |
| `npm run dev` | Type-check, build, and serve the application locally. |
| `npm run build` | Run TypeScript checks and create the static build in `dist/`. |
| `npm run preview` | Serve an existing `dist/` build without rebuilding it. |

The preview server binds to `127.0.0.1` and uses port `4173` by default. To use a different port:

```sh
PORT=4174 npm run dev
```

If the local page does not open, confirm that the server is running and that the build completed successfully. If you run `npm run preview` on a fresh checkout, run `npm run build` first.

## Main experiences

- **Hero:** Owl and balloon introduction, sky background, and primary calculator.
- **Contract estimator:** Resort selection, total contract points, independently editable annual point availability, and Use Year selection.
- **Estimate results:** An editable asking-price range with feedback for prices below, within, or above the recommended range.
- **Why sell with us:** Four animated feature cards covering selling speed, pricing, buyer reach, and managing a sale in one place.
- **Brand story:** Cloud reveals, typewriter text, and an owl flight and landing sequence.
- **Selling journey and FAQs:** Step-based storytelling, expandable answers, and calls to action that reflect whether an estimate has been created.

## Technology

React 19, TypeScript, Motion, Lenis, and Three.js. Rollup builds the application, and a small Node.js HTTP server provides the local preview. The active build uses `rollup.config.mjs`; the remaining Vite configuration files are not used by the npm scripts.

## Project structure

```text
src/
  App.tsx              Page composition and shared estimate state
  main.tsx             React entry point
  styles.css           Layout, typography, responsive styles, and animations
  types.ts             Shared calculator types
  components/          Calculator, result sheet, content sections, and scenes
public/assets/         Images, icons, video, and owl animation frames
design/                Design explorations and source artwork
scripts/               Local preview server and asset preparation utilities
index.html             HTML entry point
rollup.config.mjs      Build configuration and static asset copying
```

The Swift utilities in `scripts/` are optional asset preparation tools for macOS. They are not needed to install, build, or preview the website.

## Static hosting

Run `npm run build` and publish the contents of `dist/` to a static host. Asset URLs currently begin at the domain root, such as `/assets/app.js` and `/styles.css`. Hosting under a subdirectory requires updating those paths before deployment.

The repository does not currently include an automated deployment workflow.

## Working on the project

Keep code, comments, and documentation in English. Review changes and request approval before pushing them to GitHub.

Dependencies, generated builds, TypeScript build caches, and environment files are excluded through `.gitignore`. No API credentials are required to run the current front-end prototype.
