"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface DeviceInfo {
  isMobile: boolean
  isTouch: boolean
  viewportWidth: number
  devicePixelRatio: number
  isDetected: boolean
  isLowPower: boolean
}

function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTouch: false,
      viewportWidth: 1024,
      devicePixelRatio: 1,
      isDetected: false,
      isLowPower: false
    }
  }

  const viewportWidth = window.innerWidth
  const devicePixelRatio = window.devicePixelRatio || 1
  
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isMobile = viewportWidth < 768 || isTouch
  
  // Only consider low-power if very low cores AND mobile/touch
  const cores = navigator.hardwareConcurrency || 8
  const isLowPower = cores <= 2 && (isTouch || isMobile)

  return {
    isMobile,
    isTouch,
    viewportWidth,
    devicePixelRatio,
    isDetected: true,
    isLowPower
  }
}



export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(getDeviceInfo())
    }

    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)
    
    if (navigator.maxTouchPoints > 0) {
      window.matchMedia('(pointer: coarse)').addEventListener('change', updateDeviceInfo)
    }

    // Mark as mounted to avoid hydration mismatch
    setMounted(true)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  // Only check device constraints - always track mouse for smooth transition
  const canShowCursor = !deviceInfo.isMobile && !deviceInfo.isTouch && !deviceInfo.isLowPower

  // Track mouse movement regardless, just hide/show based on device
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    const handleHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const linkElement = target.closest("a[href]")
      if (linkElement) {
        setIsHovering(true)
      }
    }

    const handleHoverEnd = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const linkElement = target.closest("a[href]")
      if (linkElement) {
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
  }, [])

  // Don't render anything before mounted to avoid hydration mismatch
  // Also check device constraints
  const shouldShowCursor = mounted && canShowCursor
  
  if (!shouldShowCursor) {
    return null
  }

  // Determine which cursor image to show
  const showHoverCursor = isVisible && isHovering
  const showNormalCursor = isVisible && !isHovering

  return (
    <>
      {/* Custom Cursor Image */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999999]"
        animate={{
          x: position.x,
          y: position.y,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
      >
        <img 
          src={isHovering ? "/cursor_hover.png" : "/cursor_normal.png"}
          alt="cursor" 
          className="w-8 h-8"
        />
      </motion.div>
    </>
  )
}
