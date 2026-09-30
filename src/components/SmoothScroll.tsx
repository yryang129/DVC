import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      anchors: true,
    });

    const handleScrollLock = (event: Event) => {
      const shouldLock = (event as CustomEvent<boolean>).detail;
      if (shouldLock) lenis.stop();
      else lenis.start();
    };

    window.addEventListener("dvc:scroll-lock", handleScrollLock);

    return () => {
      window.removeEventListener("dvc:scroll-lock", handleScrollLock);
      lenis.start();
      lenis.destroy();
    };
  }, []);

  return null;
}
