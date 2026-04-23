/**
 * VIEW — HeroGlobe (Fixed 3D Railway Inspection Vehicle scene)
 * Built with @react-three/fiber + @react-three/drei
 * Scene: Inspection bot on rails, animated wheels, pulsing sensor beam
 * Orientation: Aligned with track (Z-axis), moving towards distance.
 */
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Trail, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ── Wheel (cylinder rotated to face sideways) ─────────────────────────── */
function Wheel({ position, side = 1 }) {
  const ref = useRef();
  // Rotate around X (the axle)
  useFrame((_, dt) => { 
    if (ref.current) ref.current.rotation.x += dt * 8; 
  });
  
  return (
    <group position={position}>
      {/* The rotating wheel part */}
      <mesh ref={ref} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 24]} />
        <meshStandardMaterial color="#f5a623" metalness={0.7} roughness={0.2} />
        
        {/* Spokes (visual indicators of rotation) */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2, (i * Math.PI) / 3, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.04]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        ))}
      </mesh>
      
      {/* Hub (static relative to spin) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

/* ── Rail track (scrolling along Z) ──────────────────────────────────── */
function Rails() {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) {
      // Rails move towards the camera to simulate forward movement
      ref.current.position.z += dt * 2;
      if (ref.current.position.z > 0.7) ref.current.position.z = 0;
    }
  });
  
  const tiePositions = [-8, -7.3, -6.6, -5.9, -5.2, -4.5, -3.8, -3.1, -2.4, -1.7, -1.0, -0.3, 0.4, 1.1, 1.8, 2.5, 3.2, 3.9, 4.6, 5.3, 6.0];
  
  return (
    <group ref={ref}>
      {/* Left rail */}
      <mesh position={[-0.35, -0.5, 0]}>
        <boxGeometry args={[0.06, 0.06, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Right rail */}
      <mesh position={[0.35, -0.5, 0]}>
        <boxGeometry args={[0.06, 0.06, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Ties (sleepers) */}
      {tiePositions.map((z, i) => (
        <mesh key={i} position={[0, -0.55, z]}>
          <boxGeometry args={[0.9, 0.04, 0.16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Sensor pulse beam (Front facing) ─────────────────────────────────── */
function SensorBeam() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = Math.sin(clock.elapsedTime * 4);
      ref.current.scale.z = 0.5 + t * 0.4;
      ref.current.material.opacity = 0.3 + t * 0.4;
    }
  });
  return (
    <mesh ref={ref} position={[0, -0.05, -0.8]} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[0.1, 0.8, 12, 1, true]} />
      <meshBasicMaterial color="#06b6d4" transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Antenna ─────────────────────────────────────────────────────────── */
function Antenna() {
  const led = useRef();
  useFrame(({ clock }) => {
    if (led.current) {
      const t = Math.sin(clock.elapsedTime * 6);
      led.current.material.emissiveIntensity = 1 + t * 2;
    }
  });
  return (
    <group position={[0.2, 0.4, 0.3]}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh ref={led} position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

/* ── Main vehicle body (Aligned with Z) ────────────────────────────────── */
function InspectionVehicle() {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 12) * 0.006;
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 8) * 0.004;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Chassis */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.6, 0.15, 1.6]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>

      {/* Main body */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.55, 0.45, 1.4]} />
        <meshStandardMaterial color="#0d1425" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Amber stripe (roof) */}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.55, 0.05, 1.4]} />
        <meshStandardMaterial color="#f5a623" emissive="#f5a623" emissiveIntensity={0.3} />
      </mesh>

      {/* Headlight (Front facing -Z) */}
      <mesh position={[0, 0.05, -0.72]}>
        <boxGeometry args={[0.3, 0.12, 0.05]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={3} />
      </mesh>
      
      {/* Light cone */}
      <mesh position={[0, 0.05, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 1, 16, 1, true]} />
        <meshBasicMaterial color="#fef9c3" transparent opacity={0.15} />
      </mesh>

      {/* Cabin windows (Side) */}
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x * 0.9, 0.2, -0.2]}>
          <boxGeometry args={[0.02, 0.2, 0.6]} />
          <meshPhysicalMaterial color="#06b6d4" transparent opacity={0.4} roughness={0} />
        </mesh>
      ))}
      
      {/* Front windshield */}
      <mesh position={[0, 0.2, -0.71]}>
        <boxGeometry args={[0.45, 0.25, 0.02]} />
        <meshPhysicalMaterial color="#06b6d4" transparent opacity={0.4} roughness={0} />
      </mesh>

      <SensorBeam />
      <Antenna />

      {/* Wheels */}
      <Wheel position={[-0.35, -0.36, -0.5]} side={-1} />
      <Wheel position={[ 0.35, -0.36, -0.5]} side={1} />
      <Wheel position={[-0.35, -0.36,  0.5]} side={-1} />
      <Wheel position={[ 0.35, -0.36,  0.5]} side={1} />
    </group>
  );
}

/* ── Scene ─────────────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#fff7ed" />
      <pointLight position={[-3, 2, -3]} intensity={1.5} color="#06b6d4" />
      <pointLight position={[3, -1, 3]} intensity={1} color="#f5a623" />

      <InspectionVehicle />
      <Rails />

      {/* Ambient data orbs */}
      <Orb position={[-2,  1, -2]} color="#f5a623" speed={1.2} />
      <Orb position={[ 2,  1.2, 2]} color="#06b6d4" speed={1} />
      <Orb position={[ 0,  1.5, -4]} color="#ef4444" speed={1.5} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        makeDefault
      />
    </>
  );
}

function Orb({ position, color, speed = 1 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed) * 0.15;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  );
}

export default function HeroGlobe() {
  return (
    <Canvas
      camera={{ position: [2.2, 1.2, 3], fov: 40 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
