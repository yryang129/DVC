import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = { runId: number };

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value: number) => {
  const amount = clamp(value);
  return amount * amount * (3 - 2 * amount);
};

const easeOutBack = (value: number) => {
  const amount = clamp(value) - 1;
  const overshoot = 1.25;
  return 1 + (overshoot + 1) * amount ** 3 + overshoot * amount ** 2;
};

export function MascotIntroThreeSceneV2({ runId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.z = 11;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const mascotTexture = loader.load("/assets/mascot-purple-lime-balloons-clean-v3.png");
    mascotTexture.colorSpace = THREE.SRGBColorSpace;

    const mascotMaterial = new THREE.MeshBasicMaterial({
      map: mascotTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      toneMapped: false,
    });

    const mascot = new THREE.Mesh(new THREE.PlaneGeometry(5.05, 6.6), mascotMaterial);
    mascot.position.z = 0.3;
    mascot.renderOrder = 4;
    scene.add(mascot);

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const clock = new THREE.Clock();
    let frame = 0;
    let disposed = false;

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.set(
        (event.clientX / window.innerWidth - 0.5) * 0.2,
        -(event.clientY / window.innerHeight - 0.5) * 0.12,
      );
    };

    const render = () => {
      if (disposed) return;
      const seconds = clock.getElapsedTime();
      const reduced = reducedMotionQuery.matches;
      const compact = camera.aspect < 0.78;
      pointer.lerp(pointerTarget, 0.03);

      const arrival = reduced ? 1 : easeOutBack(seconds / 1.08);
      const exit = reduced ? 1 : smooth((seconds - 1.58) / 0.36);
      const opacity = reduced ? 0 : smooth(seconds / 0.18) * (1 - exit);
      const scale = compact ? 0.72 : 0.84;

      mascot.position.set(
        pointer.x * 0.12 + Math.sin(seconds * 1.15) * 0.035,
        THREE.MathUtils.lerp(-9.4, 0.2, arrival) + Math.sin(seconds * 1.85) * 0.045 * (1 - exit),
        0.3,
      );
      mascot.scale.setScalar(scale * (0.96 + arrival * 0.04));
      mascot.rotation.z = Math.sin(seconds * 1.05) * 0.018 * (1 - exit);
      mascotMaterial.opacity = opacity;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    frame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      mascot.geometry.dispose();
      mascotMaterial.dispose();
      mascotTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [runId]);

  return <div className="mascot-intro-scene" ref={containerRef} />;
}
