"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface DeviceInfo {
  isMobile: boolean
  isTouch: boolean
  viewportWidth: number
  devicePixelRatio: number
  isDetected: boolean
}

function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    // Server-side - assume mobile until proven otherwise
    return {
      isMobile: true,
      isTouch: true,
      viewportWidth: 0,
      devicePixelRatio: 1,
      isDetected: false
    }
  }

  const viewportWidth = window.innerWidth
  const devicePixelRatio = window.devicePixelRatio || 1
  
  // Check for touch device
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // Check for mobile based on viewport width and touch capability
  const isMobile = viewportWidth < 768 || isTouch

  return {
    isMobile,
    isTouch,
    viewportWidth,
    devicePixelRatio,
    isDetected: true
  }
}

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo())

  // Update device info on resize
  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(getDeviceInfo())
    }

    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)
    
    // Also listen for device change events
    if (navigator.maxTouchPoints > 0) {
      // This helps detect when a device switches between touch and mouse
      window.matchMedia('(pointer: coarse)').addEventListener('change', updateDeviceInfo)
    }

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  // Don't show custom cursor on mobile/touch devices or before detection
  // We need isDetected to be true AND not be a mobile/touch device
  const shouldShowCursor = deviceInfo.isDetected && !deviceInfo.isMobile && !deviceInfo.isTouch

  useEffect(() => {
    // Don't add event listeners if we shouldn't show cursor
    if (!shouldShowCursor) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    const handleHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("a, button, [data-cursor-hover]")) {
        setIsHovering(true)
      }
    }

    const handleHoverEnd = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("a, button, [data-cursor-hover]")) {
        setIsHovering(false)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseover", handleHoverStart)
    document.addEventListener("mouseout", handleHoverEnd)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseover", handleHoverStart)
      document.removeEventListener("mouseout", handleHoverEnd)
    }
  }, [shouldShowCursor])

  // Don't render anything on mobile/touch devices or before detection
  // This ensures the cursor doesn't appear during SSR or on mobile
  if (!shouldShowCursor) {
    return null
  }

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[10000] mix-blend-difference"
        animate={{
          x: position.x - 6,
          y: position.y - 6,
          scale: isHovering ? 0 : 5,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
      />
      {/* Hover ring */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border border-white rounded-full pointer-events-none z-[10000] mix-blend-difference"
        animate={{
          x: position.x - 24,
          y: position.y - 24,
          scale: isHovering ? 1 : 0,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.8 }}
      />
    </>
  )
}
