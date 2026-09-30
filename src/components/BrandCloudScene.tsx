import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

type BrandCloudSceneProps = {
  progress?: MotionValue<number>;
  open?: boolean;
  duration?: number;
};

type CloudLayer = {
  sprite: THREE.Sprite;
  from: THREE.Vector3;
  to: THREE.Vector3;
  fromScale: THREE.Vector2;
  toScale: THREE.Vector2;
  phase: number;
  delay: number;
  speed: number;
  curveX: number;
  curveY: number;
  opacityFrom: number;
  opacityTo: number;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

export function BrandCloudScene({ progress, open, duration = 2600 }: BrandCloudSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress?.get() ?? (open ? 1 : 0));

  useEffect(() => {
    if (!progress) return;
    progressRef.current = progress.get();
    return progress.on("change", (value) => {
      progressRef.current = value;
    });
  }, [progress]);

  useEffect(() => {
    if (open === undefined || progress) return;
    const from = progressRef.current;
    const target = open ? 1 : 0;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - startedAt) / duration);
      const eased = smooth(elapsed);
      progressRef.current = THREE.MathUtils.lerp(from, target, eased);
      if (elapsed < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, open, progress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 20);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const texture = new THREE.TextureLoader().load("/assets/cloud.png");
    texture.colorSpace = THREE.SRGBColorSpace;

    const specifications = [
      { from: [-4.6, 3.6, 0.1], to: [-7.4, 4.1, 0.1], fromScale: [9.8, 4.0], toScale: [7.2, 3.0], opacityFrom: 0.98, opacityTo: 0.7, phase: 0.2, delay: 0.00, speed: 1.06, curveX: -0.35, curveY: 0.22 },
      { from: [-0.7, 4.2, -0.1], to: [-3.7, 5.0, -0.1], fromScale: [8.4, 3.45], toScale: [6.5, 2.7], opacityFrom: 0.92, opacityTo: 0.58, phase: 1.3, delay: 0.06, speed: 1.13, curveX: 0.24, curveY: -0.12 },
      { from: [4.9, 3.5, -0.2], to: [7.2, 3.65, -0.2], fromScale: [7.7, 3.2], toScale: [6.4, 2.65], opacityFrom: 0.88, opacityTo: 0.6, phase: 2.4, delay: 0.13, speed: 1.18, curveX: 0.42, curveY: -0.2 },
      { from: [-5.2, -3.75, 0], to: [-7.25, -4.25, 0], fromScale: [8.7, 3.55], toScale: [6.5, 2.75], opacityFrom: 0.94, opacityTo: 0.68, phase: 3.1, delay: 0.08, speed: 1.1, curveX: 0.28, curveY: 0.18 },
      { from: [0.4, -4.2, -0.15], to: [3.25, -5.15, -0.15], fromScale: [9.1, 3.7], toScale: [6.8, 2.8], opacityFrom: 0.96, opacityTo: 0.58, phase: 4.4, delay: 0.0, speed: 0.96, curveX: -0.38, curveY: -0.15 },
      { from: [5.1, -3.25, -0.25], to: [7.55, -3.9, -0.25], fromScale: [7.2, 3.0], toScale: [5.8, 2.4], opacityFrom: 0.84, opacityTo: 0.5, phase: 5.2, delay: 0.19, speed: 1.24, curveX: 0.18, curveY: 0.24 },
    ];

    const clouds: CloudLayer[] = specifications.map((specification) => {
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: specification.opacityFrom,
      });
      const sprite = new THREE.Sprite(material);
      const from = new THREE.Vector3(...specification.from);
      const to = new THREE.Vector3(...specification.to);
      const fromScale = new THREE.Vector2(...specification.fromScale);
      const toScale = new THREE.Vector2(...specification.toScale);
      sprite.position.copy(from);
      sprite.scale.set(fromScale.x, fromScale.y, 1);
      scene.add(sprite);
      return { sprite, from, to, fromScale, toScale, phase: specification.phase, delay: specification.delay, speed: specification.speed, curveX: specification.curveX, curveY: specification.curveY, opacityFrom: specification.opacityFrom, opacityTo: specification.opacityTo };
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let disposed = false;

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      const aspect = width / height;
      camera.left = -5 * aspect;
      camera.right = 5 * aspect;
      camera.top = 5;
      camera.bottom = -5;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const render = (time: number) => {
      if (disposed) return;
      const baseProgress = reducedMotion.matches ? 1 : clamp(progressRef.current);
      const seconds = time / 1000;

      clouds.forEach((cloud) => {
        const localProgress = reducedMotion.matches ? 1 : smooth(clamp((baseProgress - cloud.delay) * cloud.speed));
        cloud.sprite.position.lerpVectors(cloud.from, cloud.to, localProgress);
        cloud.sprite.position.x += Math.sin(localProgress * Math.PI) * cloud.curveX;
        cloud.sprite.position.y += Math.sin(localProgress * Math.PI) * cloud.curveY;
        cloud.sprite.position.y += reducedMotion.matches ? 0 : Math.sin(seconds * 0.22 + cloud.phase) * 0.08;
        const width = THREE.MathUtils.lerp(cloud.fromScale.x, cloud.toScale.x, localProgress);
        const height = THREE.MathUtils.lerp(cloud.fromScale.y, cloud.toScale.y, localProgress);
        cloud.sprite.scale.set(width, height, 1);
        cloud.sprite.material.opacity = THREE.MathUtils.lerp(cloud.opacityFrom, cloud.opacityTo, localProgress);
      });

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      clouds.forEach(({ sprite }) => sprite.material.dispose());
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="brand-story-clouds-three" ref={containerRef} aria-hidden="true" />;
}
