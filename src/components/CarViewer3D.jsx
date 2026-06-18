import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, Html, ContactShadows } from '@react-three/drei'

const MODEL = '/assets/2022_toyota_hilux/scene.gltf'

function HiluxModel() {
  const { scene } = useGLTF(MODEL)
  const ref = useRef()

  // Gentle continuous rotation — pauses when user interacts via OrbitControls
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.18
  })

  return (
    <primitive
      ref={ref}
      object={scene}
      position={[0, -0.38, 0]}
      scale={1.12}
    />
  )
}

function Loader() {
  return (
    <Html center>
      <span style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        letterSpacing: 2,
        color: '#9a9aa0',
        textTransform: 'uppercase',
      }}>
        Loading model…
      </span>
    </Html>
  )
}

export default function CarViewer3D() {
  return (
    <Canvas
      camera={{ position: [3.2, 1.1, 3.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* Lighting — warm key + cool fill for a premium studio look */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 8, 4]} intensity={1.4} castShadow={false} />
      <directionalLight position={[-4, 3, -2]} intensity={0.5} color="#c8d8f0" />
      <pointLight position={[0, 6, 0]} intensity={0.4} color="#fff8f0" />

      <Suspense fallback={<Loader />}>
        <HiluxModel />

        {/* Soft ground shadow */}
        <ContactShadows
          position={[0, -0.4, 0]}
          opacity={0.28}
          scale={6}
          blur={2.5}
          far={0.8}
          color="#18181c"
        />

        {/* City reflections on the metallic body */}
        <Environment preset="city" />
      </Suspense>

      {/* Drag to rotate; disable zoom/pan for clean UX */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        dampingFactor={0.06}
        enableDamping
      />
    </Canvas>
  )
}

// Preload so it's ready before the user scrolls to Spotlight
useGLTF.preload(MODEL)
