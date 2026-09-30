import { useEffect, useRef } from "react";
import * as THREE from "three";

type MascotIntroThreeSceneProps = {
  runId: number;
};

type CloudSprite = {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  base: THREE.Vector3;
  destination: THREE.Vector3;
  scale: THREE.Vector2;
  phase: number;
  speed: number;
  finalCloud: boolean;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smooth = (value: number) => {
  const amount = clamp(value);
  return amount * amount * (3 - 2 * amount);
};

const easeOutBack = (value: number) => {
  const amount = clamp(value) - 1;
  const overshoot = 1.45;
  return 1 + (overshoot + 1) * amount ** 3 + overshoot * amount ** 2;
};

export function MascotIntroThreeScene({ runId }: MascotIntroThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.z = 11;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const mascotTexture = loader.load("/assets/mascot-balloon-cutout.png");
    const cloudTexture = loader.load("/assets/cloud.png");
    mascotTexture.colorSpace = THREE.SRGBColorSpace;
    cloudTexture.colorSpace = THREE.SRGBColorSpace;

    const mascotMaterial = new THREE.SpriteMaterial({
      map: mascotTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });
    const mascot = new THREE.Sprite(mascotMaterial);
    mascot.renderOrder = 4;
    scene.add(mascot);

    const cloudData = [
      { from: [-5.7, 2.5, -0.8], to: [-7, 2.2, -1], size: [6.5, 2.6], phase: 0.2, speed: 0.34, final: false },
      { from: [5.8, 0.85, -0.25], to: [7.2, 1.3, -0.4], size: [6.2, 2.5], phase: 2.4, speed: 0.29, final: false },
      { from: [-4.8, -2.8, 0.15], to: [-2.8, -2.6, -0.2], size: [6.2, 2.45], phase: 1.4, speed: 0.25, final: true },
      { from: [5.6, 2.7, 0.1], to: [3.35, 2.35, -0.15], size: [5.7, 2.25], phase: 3.8, speed: 0.3, final: true },
      { from: [4.7, -3.5, -0.9], to: [2.9, -3.1, -0.8], size: [4.3, 1.7], phase: 5.2, speed: 0.22, final: true },
    ] as const;

    const clouds: CloudSprite[] = cloudData.map((spec) => {
      const material = new THREE.SpriteMaterial({
        map: cloudTexture,
        transparent: true,
        depthWrite: false,
        opacity: spec.final ? 0 : 0.84,
      });
      const sprite = new THREE.Sprite(material);
      const base = new THREE.Vector3(...spec.from);
      const destination = new THREE.Vector3(...spec.to);
      sprite.position.copy(base);
      sprite.scale.set(spec.size[0], spec.size[1], 1);
      sprite.renderOrder = spec.final ? 2 : 3;
      scene.add(sprite);
      return {
        sprite,
        material,
        base,
        destination,
        scale: new THREE.Vector2(...spec.size),
        phase: spec.phase,
        speed: spec.speed,
        finalCloud: spec.final,
      };
    });

    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 34;
    const sparklePositions = new Float32Array(sparkleCount * 3);
    const sparkleSeeds = Array.from({ length: sparkleCount }, (_, index) => ({
      x: (Math.sin(index * 71.3) * 0.5 + 0.5) * 4.2 - 2.1,
      y: (Math.sin(index * 29.7 + 1.4) * 0.5 + 0.5) * 4.8 - 2.25,
      drift: 0.25 + (index % 7) * 0.045,
    }));
    sparkleGeometry.setAttribute("position", new THREE.BufferAttribute(sparklePositions, 3));
    const sparkleMaterial = new THREE.PointsMaterial({
      color: 0xf3ffd0,
      size: 0.075,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    sparkles.renderOrder = 5;
    scene.add(sparkles);

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

    const handlePointer = (event: PointerEvent) => {
      pointerTarget.set(
        (event.clientX / window.innerWidth - 0.5) * 0.38,
        -(event.clientY / window.innerHeight - 0.5) * 0.25,
      );
    };

    const render = () => {
      if (disposed) return;
      const seconds = clock.getElapsedTime();
      const reduced = reducedMotionQuery.matches;
      const compact = camera.aspect < 0.78;
      const sceneScale = compact ? 0.72 : 1;
      pointer.lerp(pointerTarget, 0.032);

      const fall = reduced ? 1 : easeOutBack(seconds / 2.45);
      const hover = Math.sin(seconds * 2.15) * 0.07 * (1 - smooth((seconds - 2.45) / 1.8));
      const mascotFadeIn = reduced ? 0 : smooth(seconds / 0.35);
      const mascotFadeOut = reduced ? 1 : smooth((seconds - 3.4) / 0.9);
      const mascotScale = (compact ? 4.5 : 5.55) * (0.93 + fall * 0.07);
      mascot.position.set(
        pointer.x * 0.22 + Math.sin(seconds * 1.22) * 0.055,
        THREE.MathUtils.lerp(7.4, 0.55, fall) + hover + mascotFadeOut * 0.5,
        0.35,
      );
      mascot.scale.set(mascotScale * 0.786, mascotScale, 1);
      mascotMaterial.rotation = Math.sin(seconds * 1.08) * 0.028 * (1 - mascotFadeOut);
      mascotMaterial.opacity = mascotFadeIn * (1 - mascotFadeOut);

      const cloudTransition = reduced ? 1 : smooth((seconds - 2.85) / 1.35);
      clouds.forEach((cloud, index) => {
        const transition = cloud.finalCloud ? cloudTransition : smooth((seconds - 2.55) / 1.15);
        cloud.sprite.position.lerpVectors(cloud.base, cloud.destination, transition);
        cloud.sprite.position.x *= sceneScale;
        cloud.sprite.position.x += pointer.x * (cloud.finalCloud ? 0.7 : -0.42);
        cloud.sprite.position.y += Math.sin(seconds * cloud.speed + cloud.phase) * 0.12;
        const compactScale = compact ? (index === 3 ? 0.68 : 0.82) : 1;
        cloud.sprite.scale.set(
          cloud.scale.x * compactScale,
          cloud.scale.y * compactScale,
          1,
        );
        cloud.material.opacity = cloud.finalCloud
          ? 0.88 * cloudTransition
          : 0.84 * (1 - transition);
        cloud.material.rotation = Math.sin(seconds * 0.18 + cloud.phase) * 0.012;
      });

      const sparkleProgress = smooth((seconds - 3.2) / 1.1);
      sparkleMaterial.opacity = Math.sin(sparkleProgress * Math.PI) * 0.82;
      sparkleSeeds.forEach((seed, index) => {
        const offset = index * 3;
        sparklePositions[offset] = seed.x * (0.55 + sparkleProgress * 0.7);
        sparklePositions[offset + 1] = seed.y + sparkleProgress * seed.drift * 3.5;
        sparklePositions[offset + 2] = 0.5;
      });
      sparkleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    frame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointer);
      clouds.forEach(({ material }) => material.dispose());
      mascotMaterial.dispose();
      mascotTexture.dispose();
      cloudTexture.dispose();
      sparkleGeometry.dispose();
      sparkleMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [runId]);

  return <div className="mascot-intro-scene" ref={containerRef} />;
}
