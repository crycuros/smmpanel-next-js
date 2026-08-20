"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

const projects = [
  {
    title: "Instagram Followers",
    tags: ["Instant", "Real", "Best Price"],
    image: "/follow.png",
    year: "2024",
  },
  {
    title: "TikTok Views",
    tags: ["Viral", "Fast", "Bulk"],
    image: "/views.png",
    year: "2024",
  },
  {
    title: "YouTube Subscribers",
    tags: ["Quality", "Retention", "Safe"],
    image: "/subs.png",
    year: "2023",
  },
  {
    title: "Facebook Likes",
    tags: ["Page Likes", "Post Engagement"],
    image: "/like.png",
    year: "2023",
  },
]

export function Works() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    }
  }

  return (
    <section className="relative py-16 md:py-24 lg:py-32 px-4 md:px-12">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-12 md:mb-20"
      >
        <p className="font-mono text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] text-rose-600 mb-3 md:mb-4">04 — SOLUTIONS</p>
        <h2 className="font-sans text-2xl md:text-4xl lg:text-5xl font-light italic text-slate-900">Our Services</h2>
      </motion.div>

      {/* Projects List */}
      <div ref={containerRef} onMouseMove={handleMouseMove} className="relative">
        {projects.map((project, index) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="relative border-t border-rose-200 py-6 md:py-10"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <a
              href="#"
              data-cursor-hover
              className="group flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4"
            >
              {/* Year */}
              <span className="font-mono text-[10px] md:text-xs text-slate-500 tracking-widest order-1 md:order-none">
                {project.year}
              </span>

              {/* Title */}
              <motion.h3
                className="font-sans text-xl sm:text-2xl md:text-4xl lg:text-5xl font-light tracking-tight group-hover:text-rose-600 transition-colors duration-300 flex-1 text-slate-900 text-balance"
                animate={{
                  x: hoveredIndex === index ? 10 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {project.title}
              </motion.h3>

              {/* Tags */}
              <div className="flex gap-1 md:gap-2 flex-wrap order-2 md:order-none">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[8px] md:text-[10px] tracking-wider px-2 md:px-3 py-1 border border-rose-300 rounded-full text-rose-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          </motion.div>
        ))}

        {/* Floating Image - Desktop only */}
        <motion.div
          className="hidden md:block absolute pointer-events-none z-50 w-64 h-40 lg:w-80 lg:h-48 overflow-hidden rounded-lg"
          style={{
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-320%",
          }}
          animate={{
            opacity: hoveredIndex !== null ? 1 : 0,
            scale: hoveredIndex !== null ? 1 : 0.8,
          }}
          transition={{ duration: 0.2 }}
        >
          {hoveredIndex !== null && (
            <motion.img
              src={projects[hoveredIndex].image}
              alt={projects[hoveredIndex].title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                filter: "grayscale(50%) contrast(1.1)",
              }}
            />
          )}
          {/* Glitch overlay */}
          <div className="absolute inset-0 bg-rose-500/0" />
        </motion.div>
      </div>

      {/* Bottom Border */}
      <div className="border-t border-rose-200" />
    </section>
  )
}
