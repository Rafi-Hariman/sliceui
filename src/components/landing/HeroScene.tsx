import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { dotsTexture, SCENE_COLORS } from "./scene";

const DPR = [1, 1.8] as [number, number];

/* ── The glowing core — a torus-knot "emerald" of the stack ──── */

function Core({ isDark }: { isDark: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  const outer = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    group.current.rotation.y += delta * 0.35;
    group.current.rotation.x = Math.sin(t * 0.18) * 0.1;
    const s = 1 + Math.sin(t * 1.4) * 0.06;
    inner.current.scale.setScalar(s);
    outer.current.rotation.z += delta * 0.6;
  });

  return (
    <group position={[0, -0.4, 0]}>
      <pointLight color={SCENE_COLORS.indigo} intensity={40} distance={10} decay={2} />
      <group ref={group}>
        <mesh ref={inner}>
          <torusKnotGeometry args={[0.36, 0.11, 160, 24]} />
          <meshStandardMaterial
            color="#a5b4fc"
            metalness={0.95}
            roughness={0.25}
            emissive={SCENE_COLORS.indigo}
            emissiveIntensity={isDark ? 0.55 : 0.85}
          />
        </mesh>
        <mesh ref={outer}>
          <torusKnotGeometry args={[0.52, 0.015, 120, 12]} />
          <meshBasicMaterial color={SCENE_COLORS.cyan} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Concentric orbit rings around the core ──────────────────── */

function Rings() {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    group.current.rotation.z += delta * 0.18;
    group.current.rotation.x = Math.sin(performance.now() * 0.0002) * 0.02;
  });
  const ringGeo = useMemo(() => new THREE.TorusGeometry(1.05, 0.004, 8, 140), []);
  return (
    <group ref={group} position={[0, -0.4, 0]}>
      <mesh geometry={ringGeo}>
        <meshBasicMaterial color={SCENE_COLORS.indigo} transparent opacity={0.28} toneMapped={false} />
      </mesh>
      <mesh geometry={ringGeo} rotation={[Math.PI / 2.6, 0, 0]} scale={1.35}>
        <meshBasicMaterial color={SCENE_COLORS.cyan} transparent opacity={0.16} toneMapped={false} />
      </mesh>
      <mesh geometry={ringGeo} rotation={[-Math.PI / 3.4, 0, 0]} scale={1.7}>
        <meshBasicMaterial color={SCENE_COLORS.violet} transparent opacity={0.10} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Ambient particle field ──────────────────────────────────── */

function Particles() {
  const { count, positions, sizes } = useMemo(() => {
    const count = 320;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      sizes[i] = 0.25 + Math.random() * 0.75;
    }
    return { count, positions, sizes };
  }, []);

  const dotTex = useMemo(() => dotsTexture(), []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [positions, sizes]);

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.05,
        map: dotTex,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: "#c7d2fe",
        sizeAttenuation: true,
      }),
    [dotTex],
  );

  const ref = useRef<THREE.Points>(null!);
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.02;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.15;
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

/* ── Subtle parallax rig (camera moves with the pointer) ─────── */

function Rig({ children }: { children: ReactNode }) {
  const { camera } = useThree();
  const vel = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const px = state.pointer.x;
    const py = state.pointer.y;
    const targetX = px * 0.35;
    const targetY = py * 0.25;
    const k = 1 - Math.pow(0.0015, delta);
    vel.current.x += (targetX - vel.current.x) * k;
    vel.current.y += (targetY - vel.current.y) * k;
    camera.position.x += (vel.current.x - camera.position.x) * k;
    camera.position.y += (vel.current.y - camera.position.y) * k;
    camera.lookAt(0, 0, 0);
  });

  return <>{children}</>;
}

/* ── Scene wrapper with lights, fog, and the skybox ───────────── */

function SceneContent({ targetX, isDark }: { targetX: number; isDark: boolean }) {
  // Matches --background tokens (index.css) so the WebGL canvas blends
  // seamlessly into the page in both themes.
  const bg = isDark ? "#090a12" : "#f6f7fd";
  const fog = bg;
  // Horizontal world→screen conversion divides by HALF the viewport WIDTH
  // (vertical fov × aspect). So a 0..1 screen fraction maps to world X via
  // (2f-1) × (viewport.width / 2).
  const { width } = useThree((s) => s.viewport);
  const coreX = (2 * targetX - 1) * (width / 2);
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <directionalLight position={[-4, 2, -3]} intensity={0.6} color={SCENE_COLORS.violet} />

      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[fog, 7, 15]} />

      <Rig>
        <group position={[coreX, 0, 0]}>
          <Core isDark={isDark} />
          <Rings />
        </group>
      </Rig>
      <Particles />
    </>
  );
}

/* ── Public component ────────────────────────────────────────── */

export function HeroScene({ targetX = 0.5, isDark = true }: { targetX?: number; isDark?: boolean }) {
  return (
    <Canvas
      flat
      dpr={DPR}
      camera={{ position: [0, 0, 7], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <SceneContent targetX={targetX} isDark={isDark} />
    </Canvas>
  );
}
