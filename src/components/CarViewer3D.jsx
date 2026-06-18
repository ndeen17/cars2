import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  useGLTF, OrbitControls, Environment,
  ContactShadows, Html, PerformanceMonitor,
} from '@react-three/drei'

const MODEL = '/assets/2022_toyota_hilux/scene.gltf'

// Detect mobile once at module load — avoids repeated window checks per render
const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth <= 768

function HiluxModel() {
  const { scene } = useGLTF(MODEL)
  return <primitive object={scene} position={[0, -0.38, 0]} scale={1.12} />
}

function Loader() {
  return (
    <Html center>
      <span style={loaderStyle}>Loading…</span>
    </Html>
  )
}

export default function CarViewer3D() {
  // Start at a capped DPR; PerformanceMonitor will lower it further if needed
  const [dpr, setDpr] = useState(() =>
    Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      IS_MOBILE ? 1.5 : 2)
  )

  return (
    <Canvas
      camera={{
        position: IS_MOBILE ? [2.6, 0.85, 2.6] : [3.2, 1.1, 3.2],
        fov:      IS_MOBILE ? 52 : 42,
      }}
      dpr={dpr}
      gl={{
        antialias:         !IS_MOBILE, // ~25 % faster on mobile
        alpha:             true,
        powerPreference:   IS_MOBILE ? 'default' : 'high-performance',
        preserveDrawingBuffer: false,
      }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* Adaptive quality — drops DPR if frame rate falls below threshold */}
      <PerformanceMonitor
        factor={1}
        threshold={0.75}
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(IS_MOBILE ? 1.5 : 2)}
      >
        {/* ── Lighting ─────────────────────────────────── */}
        <ambientLight intensity={IS_MOBILE ? 0.72 : 0.55} />
        <directionalLight
          position={[6, 8, 4]}
          intensity={IS_MOBILE ? 1.1 : 1.4}
          castShadow={false}
        />
        {/* Cool fill + top point: desktop only — too costly for mobile */}
        {!IS_MOBILE && (
          <>
            <directionalLight position={[-4, 3, -2]} intensity={0.5} color="#c8d8f0" />
            <pointLight position={[0, 6, 0]} intensity={0.4} color="#fff8f0" />
          </>
        )}

        {/* ── Scene ────────────────────────────────────── */}
        <Suspense fallback={<Loader />}>
          <HiluxModel />

          <ContactShadows
            position={[0, -0.4, 0]}
            opacity={IS_MOBILE ? 0.18 : 0.28}
            scale={IS_MOBILE ? 4 : 6}
            blur={IS_MOBILE ? 1.2 : 2.5}
            far={0.8}
            color="#18181c"
          />

          {/* IBL reflections on metallic body */}
          <Environment preset="city" />
        </Suspense>

        {/* ── Controls ─────────────────────────────────── */}
        <OrbitControls
          autoRotate
          autoRotateSpeed={IS_MOBILE ? 0.35 : 0.6}
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
          dampingFactor={IS_MOBILE ? 0.08 : 0.06}
          rotateSpeed={IS_MOBILE ? 0.45 : 0.8}
        />
      </PerformanceMonitor>
    </Canvas>
  )
}

useGLTF.preload(MODEL)

const loaderStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
  letterSpacing: 2,
  color: '#9a9aa0',
  textTransform: 'uppercase',
}
