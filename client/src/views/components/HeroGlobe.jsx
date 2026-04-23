/**
 * VIEW — HeroGlobe (Three.js animated sphere)
 * Lazy-loaded to avoid SSR/initial render issues.
 */
import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function GlowRing({ radius, color, speed, tilt }) {
  const ref = useRef();
  const geometry = useMemo(() => new THREE.TorusGeometry(radius, 0.012, 2, 120), [radius]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]} geometry={geometry}>
      <meshBasicMaterial color={color} transparent opacity={0.55} />
    </mesh>
  );
}

function TrainDot({ orbitR, speed, color, phase }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + phase;
    ref.current.position.set(Math.cos(t) * orbitR, Math.sin(t) * 0.3, Math.sin(t) * orbitR);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
    </mesh>
  );
}

function CoreSphere() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.08) * 0.15;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.1, 64, 64]} />
      <meshStandardMaterial
        color="#0d1425"
        emissive="#f5a623"
        emissiveIntensity={0.08}
        roughness={0.4}
        metalness={0.8}
      />
    </mesh>
  );
}

function WireFrame() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * -0.06;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.14, 18, 12]} />
      <meshBasicMaterial color="#f5a623" wireframe transparent opacity={0.08} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[4, 4, 4]} intensity={2} color="#f5a623" />
      <pointLight position={[-4, -2, -4]} intensity={1.2} color="#06b6d4" />
      <pointLight position={[0, 4, -4]} intensity={0.8} color="#8b5cf6" />
      <Stars radius={40} depth={30} count={1800} factor={3} saturation={0} fade speed={0.8} />
      <CoreSphere />
      <WireFrame />
      <GlowRing radius={1.55} color="#f5a623" speed={0.4}  tilt={Math.PI / 5} />
      <GlowRing radius={1.75} color="#06b6d4" speed={-0.28} tilt={Math.PI / 2.5} />
      <GlowRing radius={1.95} color="#8b5cf6" speed={0.18}  tilt={Math.PI / 7} />
      <TrainDot orbitR={1.55} speed={0.9}  color="#f5a623" phase={0} />
      <TrainDot orbitR={1.75} speed={-0.7} color="#06b6d4" phase={2.1} />
      <TrainDot orbitR={1.95} speed={0.55} color="#ef4444" phase={4.2} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
    </>
  );
}

export default function HeroGlobe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.8], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
