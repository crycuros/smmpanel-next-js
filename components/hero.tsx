"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { SentientSphere } from "./sentient-sphere"

interface HeroProps {
  enable3D?: boolean
}

export function Hero({ enable3D = true }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null)
  // Only use scroll animations on capable devices
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  // Always call hooks unconditionally, then pick values based on enable3D
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scrollScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const staticOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 1])
  const staticScale = useTransform(scrollYProgress, [0, 0.5], [1, 1])
  const opacity = enable3D ? scrollOpacity : staticOpacity
  const scale = enable3D ? scrollScale : staticScale
  
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Detect touch device
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(touch)

    // Check for logged in user
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-white via-pink-50 to-rose-50">
      {/* 3D Sphere Background */}
      {enable3D && (
        <div className="absolute inset-0 opacity-20">
          <SentientSphere />
        </div>
      )}

      {/* Typography Overlay */}
      <motion.div 
        style={{ opacity, scale }} 
        className="relative z-10 h-full flex flex-col justify-between p-4 md:p-8 lg:p-12"
      >
        {/* Top Left - Adjusted for mobile */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-8 md:mt-0"
        >
          <p className="font-mono text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] text-rose-600 mb-2">01 — SMM PANEL</p>
          <h2 className="font-sans text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-light tracking-tight text-balance text-slate-900 leading-tight md:leading-normal">
            BEST
            <br />
            <span className="italic text-rose-600">SMM PANEL</span>
          </h2>
        </motion.div>

        {/* Center Button - Link to signup or dashboard */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <Link href="/signup">
              <motion.button
                data-cursor-hover
                whileHover={!isTouchDevice ? { scale: 1.05 } : undefined}
                whileTap={{ scale: 0.95 }}
                className="relative px-6 py-3 md:px-8 md:py-4 border-2 border-rose-400 rounded-full font-mono text-xs md:text-sm tracking-widest uppercase bg-rose-500 hover:bg-rose-600 text-white transition-all duration-300 active:bg-rose-700 cursor-pointer"
              >
                Get Started
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-700 rounded-full animate-pulse" />
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Bottom Right - Adjusted for mobile */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="self-end text-right mb-8 md:mb-0"
        >
          <p className="font-mono text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] text-rose-600 mb-2">02 — PHILIPPINES</p>
          <h2 className="font-sans text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-light tracking-tight text-balance text-slate-900 leading-tight md:leading-normal">
            AFFORDABLE
            <br />
            <span className="italic text-rose-600">PRICING</span>
          </h2>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[8px] md:text-[10px] tracking-widest text-muted-foreground uppercase">Scroll</span>
          <div className="w-px h-6 md:h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}
