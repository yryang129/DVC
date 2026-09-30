import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import * as THREE from "three";

type ProofThreeSceneProps = {
  progress: MotionValue<number>;
};

export function ProofThreeScene({ progress }: ProofThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
    });
    const rings = [1.2, 2.1, 3.1, 4.3].map((radius, index) => {
      const geometry = new THREE.RingGeometry(radius, radius + 0.014, 128);
      const ring = new THREE.Mesh(geometry, ringMaterial);
      ring.position.set(-1.85, -0.45, -index * 0.08);
      group.add(ring);
      return ring;
    });

    const dotGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(54);
    for (let index = 0; index < positions.length; index += 3) {
      const angle = (index / 3) * 1.73;
      const radius = 1.2 + ((index / 3) % 6) * 0.55;
      positions[index] = Math.cos(angle) * radius - 1.2;
      positions[index + 1] = Math.sin(angle) * radius * 0.65;
      positions[index + 2] = -0.4;
    }
    dotGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const dotMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.45 });
    const dots = new THREE.Points(dotGeometry, dotMaterial);
    group.add(dots);

    const pointer = new THREE.Vector2();
    let raf = 0;
    let disposed = false;

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight, false);
      camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
      camera.updateProjectionMatrix();
    };

    const handlePointer = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 0.22,
        -((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 0.16,
      );
    };

    const render = (time: number) => {
      if (disposed) return;
      const value = progress.get();
      group.rotation.z = value * 0.18 + Math.sin(time / 7000) * 0.025;
      group.position.x += (pointer.x - group.position.x) * 0.025;
      group.position.y += (pointer.y - group.position.y) * 0.025;
      camera.position.z = 8 - value * 0.35;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    container.addEventListener("pointermove", handlePointer, { passive: true });
    raf = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", handlePointer);
      rings.forEach((ring) => ring.geometry.dispose());
      ringMaterial.dispose();
      dotGeometry.dispose();
      dotMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress]);

  return <div className="proof-three-scene" ref={containerRef} />;
}
