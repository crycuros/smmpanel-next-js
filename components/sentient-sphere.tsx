"use client"

import { useRef, useEffect, useState, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Environment, ContactShadows, OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import type { Group } from "three"

function Flower() {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF("/flower_loop.glb")
  
  // For smooth animation
  const timeRef = useRef(0)
  const baseScale = 9

  // Clone the scene for this instance
  const clonedScene = scene.clone(true)

  // Fix texture references
  useEffect(() => {
    clonedScene.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        // If material has a map that's a DataTexture with no image, set to null
        if (obj.material.map && !obj.material.map.image) {
          obj.material.map = null
        }
        // If material has an alphaMap that's a DataTexture with no image, set to null
        if (obj.material.alphaMap && !obj.material.alphaMap.image) {
          obj.material.alphaMap = null
        }
        // Ensure material is not in need of update
        obj.material.needsUpdate = true
      }
    })
  }, [clonedScene])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    timeRef.current += delta

    // Manual rotation - SLOW continuous spinning (0.15)
    groupRef.current.rotation.y += delta * 0.15

    // Floating effect - SLOW up and down (0.3)
    groupRef.current.position.y = Math.sin(timeRef.current * 0.3) * 0.1

    // Pulsing scale - SLOW breathing (0.2)
    const pulseScale = baseScale + Math.sin(timeRef.current * 0.2) * 0.15
    groupRef.current.scale.setScalar(pulseScale)
  })

  return (
    <primitive 
      ref={groupRef}
      object={clonedScene} 
      scale={4.5}
      position={[0, 0, 0]}
    />
  )
}

// Preload the model
useGLTF.preload("/flower_loop.glb")

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#fecdd3" wireframe />
    </mesh>
  )
}

export function SentientSphere() {
  const [mounted, setMounted] = useState(false)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
      if (!gl) {
        setHasWebGL(false)
      } else {
        // Check for decent GPU (basic check)
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          // If it's software rendering or very basic, skip 3D
          if (renderer.toLowerCase().includes('swift') || 
              renderer.toLowerCase().includes('software') ||
              renderer.toLowerCase().includes('llvmpipe')) {
            setHasWebGL(false)
          }
        }
      }
    } catch (e) {
      setHasWebGL(false)
    }
    
    setMounted(true)
  }, [])

  // Show fallback if no WebGL
  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 animate-pulse" />
      </div>
    )
  }

  // Show loading state during SSR
  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-64 h-64 rounded-full border-2 border-rose-300 animate-pulse bg-gradient-to-br from-rose-100 to-pink-200" />
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [50, 10, 50], fov: 45 }}
      className="w-full my-0 h-full py-0"
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#fecdd3" />
      <pointLight position={[0, 0, 10]} intensity={0.5} />
      
      <Suspense fallback={<LoadingFallback />}>
        <Flower />
        <Environment preset="sunset" />
      </Suspense>
      
      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.4}
        scale={15}
        blur={2.5}
        far={4}
      />
      
      {/* Auto-rotating camera - SLOW (0.3) */}
      <OrbitControls 
        autoRotate 
        autoRotateSpeed={0.3}
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        makeDefault
      />
    </Canvas>
  )
}


