import { useEffect, useRef } from "react";
import * as THREE from "three";

type CloudSceneProps = {
  scrollRoot: React.RefObject<HTMLElement | null>;
};

type Cloud = {
  sprite: THREE.Sprite;
  from: THREE.Vector3;
  to: THREE.Vector3;
  baseScale: THREE.Vector2;
  phase: number;
  floatAmount: number;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const ease = (value: number) => value * value * (3 - 2 * value);

export function CloudScene({ scrollRoot }: CloudSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const texture = new THREE.TextureLoader().load("/assets/cloud.png");
    texture.colorSpace = THREE.SRGBColorSpace;

    const cloudSpecs = [
      {
        from: new THREE.Vector3(5.4, 1.55, 0),
        to: new THREE.Vector3(2.8, 2.25, 0.25),
        scale: [5.6, 2.2] as const,
        opacity: 0.97,
        phase: 0,
        floatAmount: 0.15,
      },
      {
        from: new THREE.Vector3(-5.4, -3.35, -0.7),
        to: new THREE.Vector3(-3.3, -2.45, 0),
        scale: [6.2, 2.42] as const,
        opacity: 0.9,
        phase: 2.1,
        floatAmount: 0.12,
      },
      {
        from: new THREE.Vector3(0.1, -5.4, -1.3),
        to: new THREE.Vector3(0.8, -3.25, -0.4),
        scale: [3.4, 1.32] as const,
        opacity: 0.42,
        phase: 4.4,
        floatAmount: 0.09,
      },
    ];

    const clouds: Cloud[] = cloudSpecs.map((spec) => {
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: spec.opacity,
      });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(spec.from);
      sprite.scale.set(spec.scale[0], spec.scale[1], 1);
      scene.add(sprite);
      return {
        sprite,
        from: spec.from,
        to: spec.to,
        baseScale: new THREE.Vector2(spec.scale[0], spec.scale[1]),
        phase: spec.phase,
        floatAmount: spec.floatAmount,
      };
    });

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let disposed = false;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
    };

    const handlePointer = (event: PointerEvent) => {
      pointerTarget.set(
        (event.clientX / window.innerWidth - 0.5) * 0.32,
        -(event.clientY / window.innerHeight - 0.5) * 0.2,
      );
    };

    const render = (time: number) => {
      if (disposed) return;
      const travel = Math.max(window.innerHeight * 0.85, 1);
      const progress = reducedMotion.matches ? 0 : ease(clamp(window.scrollY / travel));
      const seconds = time / 1000;
      const horizontalFit = clamp(camera.aspect / 1.35, 0.42, 1);
      const compact = camera.aspect < 0.8;

      pointer.lerp(pointerTarget, 0.025);
      clouds.forEach((cloud, index) => {
        cloud.sprite.position.lerpVectors(cloud.from, cloud.to, progress);
        cloud.sprite.position.x *= horizontalFit;
        const compactScale = compact ? (index === 0 ? 0.72 : 0.86) : 1;
        cloud.sprite.scale.set(
          cloud.baseScale.x * compactScale,
          cloud.baseScale.y * compactScale,
          1,
        );
        if (compact && index === 0) cloud.sprite.position.y += 1.15;
        if (!reducedMotion.matches) {
          cloud.sprite.position.y += Math.sin(seconds * (0.34 + index * 0.04) + cloud.phase) * cloud.floatAmount;
          cloud.sprite.position.x += pointer.x * (index === 0 ? 1 : -0.55);
          cloud.sprite.position.y += pointer.y * (index === 1 ? 0.35 : 0.75);
          cloud.sprite.material.rotation = Math.sin(seconds * 0.16 + cloud.phase) * 0.012;
        }
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    raf = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointer);
      clouds.forEach(({ sprite }) => sprite.material.dispose());
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [scrollRoot]);

  return <div className="cloud-scene" ref={containerRef} />;
}
