"use client"

import { motion } from "framer-motion"

const techItems = [
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
  "FACEBOOK",
  "TWITTER",
  "LINKEDIN",
]

const concepts = [
  "FOLLOWERS",
  "LIKES",
  "VIEWS",
  "ENGAGEMENT",
  "SUBSCRIBERS",
  "RETWEETS",
]

function MarqueeRow({ items, direction = "left" }: { items: string[]; direction?: "left" | "right" }) {
  const duplicatedItems = [...items, ...items, ...items, ...items]

  return (
    <div className="relative overflow-hidden py-3 md:py-4">
      <motion.div
        className={`flex gap-6 md:gap-12 ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ width: "fit-content" }}
      >
        {duplicatedItems.map((item, index) => (
          <span
            key={index}
            className="group font-sans text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light tracking-tight whitespace-nowrap cursor-default"
            style={{
              WebkitTextStroke: "1px rgba(232, 121, 149, 0.3)",
              color: "transparent",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.webkitTextStroke = "0px"
              e.currentTarget.style.color = "#e87995"
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.color = "transparent"
              e.currentTarget.style.webkitTextStroke = "1px rgba(232, 121, 149, 0.3)"
            }}
          >
            {item}
            <span className="mx-4 md:mx-8 text-rose-300/40">•</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export function TechMarquee() {
  return (
    <section className="relative py-12 md:py-20 lg:py-24 overflow-hidden">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="px-4 md:px-12 mb-8 md:mb-12"
      >
        <p className="font-mono text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] text-rose-600 mb-3 md:mb-4">05 — PLATFORMS</p>
      </motion.div>

      {/* Marquee Rows */}
      <div className="space-y-1 md:space-y-2">
        <MarqueeRow items={techItems} direction="left" />
        <MarqueeRow items={concepts} direction="right" />
      </div>
    </section>
  )
}
