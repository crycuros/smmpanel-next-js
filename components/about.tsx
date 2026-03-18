"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

const statements = [
  "SMM Panel Services",
  "Best Prices PH",
  "Instant Delivery",
  "24/7 Support",
  "SMM Panel Services",
  "Best Prices PH",
]

export function About() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"])
  const smoothX = useSpring(x, { stiffness: 100, damping: 30 })

  return (
    <section ref={containerRef} className="relative overflow-hidden md:py-0 py-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="px-4 md:px-12 mb-0 py-12 md:py-20"
      >
        <p className="font-mono text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] text-rose-600 mb-3 md:mb-4">03 — FEATURES</p>
        <h2 className="font-sans text-2xl md:text-4xl lg:text-5xl font-light italic text-slate-900">Why Choose MND</h2>
      </motion.div>

      {/* Horizontal Scroll Container */}
      <div className="relative flex items-center overflow-hidden py-0 gap-0 h-12 md:h-16">
        <motion.div style={{ x: smoothX }} className="flex gap-8 md:gap-24 px-4 md:px-12 whitespace-nowrap">
          {statements.map((statement, index) => (
            <motion.p
              key={index}
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-sans font-light tracking-tight text-slate-900"
              style={{
                WebkitTextStroke: index % 2 === 0 ? "none" : "1px rgba(244, 63, 94, 0.3)",
                color: index % 2 === 0 ? "inherit" : "transparent",
              }}
            >
              {statement}
            </motion.p>
          ))}
        </motion.div>
      </div>

      {/* Decorative Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-12 md:mt-16 mx-4 md:mx-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent origin-left"
      />
    </section>
  )
}
