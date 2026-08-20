"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Services } from "@/components/services"
import { Works } from "@/components/works"
import { Testimonials } from "@/components/testimonials"
import { Tutorial } from "@/components/tutorial"
import { TechMarquee } from "@/components/tech-marquee"
import { Footer } from "@/components/footer"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import { SectionBlend } from "@/components/section-blend"

function useDeviceCapabilities() {
  // Default to desktop-friendly values - enable features by default
  const [capabilities, setCapabilities] = useState({
    isLowPower: false,
    isTouch: false,
    isMobile: false,
    hasWebGL: true,
    cores: 8
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const cores = navigator.hardwareConcurrency || 8
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isMobile = window.innerWidth < 768 || isTouch
    // Only consider low-power if very low cores AND it's a mobile/touch device
    const isLowPower = cores <= 2 && (isTouch || isMobile)
    
    // Check for WebGL support
    let hasWebGL = true
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      hasWebGL = !!gl
    } catch (e) {
      hasWebGL = false
    }
    
    setCapabilities({ isLowPower, isTouch, isMobile, hasWebGL, cores })
  }, [])
  
  return capabilities
}

export default function Home() {
  const { isLowPower, isTouch, isMobile, hasWebGL } = useDeviceCapabilities()
  
  // Disable smooth scroll on low-power or touch devices
  const enableSmoothScroll = !isLowPower && !isTouch
  
  // Enable custom cursor only on non-mobile, non-touch, non-low-power devices
  const enableCustomCursor = !isMobile && !isTouch && !isLowPower
  
  return (
    <SmoothScroll enabled={enableSmoothScroll}>
      {enableCustomCursor && <CustomCursor />}
      <Navbar />
      <main>
        <Hero enable3D={!isLowPower && hasWebGL} />
        <SectionBlend />
        <About />
        <Services />
        <Works />
        <Testimonials />
        <Tutorial />
        <TechMarquee />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
