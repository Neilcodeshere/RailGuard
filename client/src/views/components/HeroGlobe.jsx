/**
 * VIEW — HeroGlobe (replaced with 3D Railway Inspection Vehicle scene)
 * Built with @react-three/fiber + @react-three/drei
 * Scene: Floating inspection bot on rails, animated wheels, pulsing sensor beam
 */
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Trail, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ── Wheel (cylinder rotated to face X axis) ─────────────────────────── */
function Wheel({ position }) {
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z -= dt * 2.5; });
  return (
    <group position={position}>
      {/* Tyre */}
      <mesh ref={ref}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 24]} />
        <meshStandardMaterial color="#f5a623" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Hub */}
      <mesh>
        <cylinderGeometry args={[0.07, 0.07, 0.10, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Spokes */}
      {[0, 60, 120].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <mesh key={i} rotation={[0, 0, rad]}>
            <boxGeometry args={[0.28, 0.02, 0.06]} />
            <meshStandardMaterial color="#f5a623" metalness={0.6} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Rail track (pair of rails + ties) ────────────────────────────────── */
function Rails() {
  const tiePositions = [-2, -1.3, -0.6, 0, 0.6, 1.3, 2];
  return (
    <group position={[0, -0.55, 0]}>
      {/* Left rail */}
      <mesh position={[-0.32, 0.05, 0]}>
        <boxGeometry args={[0.06, 0.06, 5.5]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Right rail */}
      <mesh position={[0.32, 0.05, 0]}>
        <boxGeometry args={[0.06, 0.06, 5.5]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Ties (sleepers) */}
      {tiePositions.map((z, i) => (
        <mesh key={i} position={[0, 0, z]}>
          <boxGeometry args={[0.85, 0.04, 0.16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Sensor pulse beam ─────────────────────────────────────────────────── */
function SensorBeam() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = Math.sin(clock.elapsedTime * 3);
      ref.current.scale.x = 0.4 + t * 0.3;
      ref.current.material.opacity = 0.4 + t * 0.4;
    }
  });
  return (
    <mesh ref={ref} position={[0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <coneGeometry args={[0.08, 0.6, 8, 1, true]} />
      <meshBasicMaterial color="#06b6d4" transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Antenna with blinking LED ─────────────────────────────────────────── */
function Antenna() {
  const led = useRef();
  useFrame(({ clock }) => {
    if (led.current) {
      const t = Math.sin(clock.elapsedTime * 4);
      led.current.material.emissiveIntensity = 0.5 + t * 1.5;
    }
  });
  return (
    <group position={[0, 0.38, 0]}>
      {/* Pole */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.26, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* LED dot */}
      <mesh ref={led} position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

/* ── Main vehicle body ─────────────────────────────────────────────────── */
function InspectionVehicle() {
  const bodyRef = useRef();

  return (
    <group rotation={[0, -0.3, 0]}>

      {/* Chassis */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[1.5, 0.12, 0.55]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Main body */}
      <mesh ref={bodyRef} position={[0, 0.14, 0]}>
        <boxGeometry args={[1.38, 0.38, 0.52]} />
        <meshStandardMaterial color="#0d1425" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Amber roof stripe */}
      <mesh position={[0, 0.335, 0]}>
        <boxGeometry args={[1.38, 0.04, 0.52]} />
        <meshStandardMaterial color="#f5a623" emissive="#f5a623" emissiveIntensity={0.4} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Cyan side stripe */}
      <mesh position={[0, 0.05, 0.263]}>
        <boxGeometry args={[1.38, 0.06, 0.01]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.05, -0.263]}>
        <boxGeometry args={[1.38, 0.06, 0.01]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
      </mesh>

      {/* Windscreen (front) */}
      <mesh position={[0.62, 0.12, 0]}>
        <boxGeometry args={[0.08, 0.25, 0.4]} />
        <meshPhysicalMaterial color="#06b6d4" transparent opacity={0.35} roughness={0} metalness={0.2} />
      </mesh>

      {/* Cabin windows */}
      {[-0.15, 0.18].map((z, i) => (
        <mesh key={i} position={[0.24, 0.16, z]}>
          <boxGeometry args={[0.5, 0.18, 0.28]} />
          <meshPhysicalMaterial color="#0ea5e9" transparent opacity={0.4} roughness={0} metalness={0.1} />
        </mesh>
      ))}

      {/* Headlight */}
      <mesh position={[0.71, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.1, 0.22]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={2} />
      </mesh>

      {/* Ultrasonic sensor housing */}
      <mesh position={[0.72, -0.04, 0]}>
        <boxGeometry args={[0.06, 0.1, 0.18]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Sensor beam */}
      <SensorBeam />

      {/* Antenna */}
      <Antenna />

      {/* Wheels — 4 corners */}
      <Wheel position={[-0.45, -0.34, 0.28]} />
      <Wheel position={[ 0.45, -0.34, 0.28]} />
      <Wheel position={[-0.45, -0.34, -0.28]} />
      <Wheel position={[ 0.45, -0.34, -0.28]} />

      {/* Rails */}
      <Rails />
    </group>
  );
}

/* ── Floating ambient orbs ─────────────────────────────────────────────── */
function Orb({ position, color, speed = 1 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed) * 0.12;
      ref.current.material.emissiveIntensity = 0.4 + Math.sin(clock.elapsedTime * speed * 1.5) * 0.3;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
    </mesh>
  );
}

/* ── Scene ─────────────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} color="#fff7ed" />
      <pointLight position={[-2, 2, -2]} intensity={0.8} color="#06b6d4" />
      <pointLight position={[2, -1, 2]} intensity={0.5} color="#f5a623" />

      <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.3}>
        <InspectionVehicle />
      </Float>

      {/* Ambient data orbs */}
      <Orb position={[-1.6,  0.6,  0.4]} color="#f5a623" speed={1.1} />
      <Orb position={[ 1.4,  0.8, -0.5]} color="#06b6d4" speed={0.9} />
      <Orb position={[ 0.2,  1.0,  0.8]} color="#ef4444" speed={1.3} />
      <Orb position={[-0.8, -0.4,  0.9]} color="#8b5cf6" speed={0.7} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.0}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}

/* ── Export ────────────────────────────────────────────────────────────── */
export default function HeroGlobe() {
  return (
    <Canvas
      camera={{ position: [2.8, 1.4, 3.2], fov: 42 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
