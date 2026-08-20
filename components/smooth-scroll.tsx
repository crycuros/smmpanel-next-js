"use client"

import { ReactLenis } from "lenis/react"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"

interface SmoothScrollProps {
  children: ReactNode
  enabled?: boolean // Optional prop to override automatic detection
}

export function SmoothScroll({ children, enabled }: SmoothScrollProps) {
  const [shouldSmooth, setShouldSmooth] = useState(true)

  useEffect(() => {
    // If enabled prop is explicitly provided, use it
    if (enabled !== undefined) {
      setShouldSmooth(enabled)
      return
    }
    
    // Otherwise, auto-detect
    // Disable smooth scroll on touch devices or low-power devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isLowPowerDevice = navigator.hardwareConcurrency <= 4
    
    if (isTouchDevice || isLowPowerDevice) {
      setShouldSmooth(false)
    }
  }, [enabled])

  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: shouldSmooth ? 0.1 : 1, 
        duration: shouldSmooth ? 1.2 : 0, 
        smoothWheel: shouldSmooth,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      }}
    >
      {children}
    </ReactLenis>
  )
}
