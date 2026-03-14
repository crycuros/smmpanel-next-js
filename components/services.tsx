"use client"

import { motion } from "framer-motion"
import { Instagram, TrendingUp, BarChart3, Clock, Zap, Users } from "lucide-react"

const services = [
  {
    icon: Instagram,
    title: "Instagram Growth",
    description: "Grow your Instagram followers with automated engagement and targeted growth strategies tailored to your niche.",
    features: ["Auto Engagement", "Content Planning", "Analytics Tracking"],
  },
  {
    icon: TrendingUp,
    title: "TikTok Trends",
    description: "Tap into viral trends and create trending content that resonates with your target audience on TikTok.",
    features: ["Trend Alerts", "Content Ideas", "Performance Metrics"],
  },
  {
    icon: BarChart3,
    title: "YouTube Optimization",
    description: "Optimize your YouTube presence with SEO tools, thumbnail suggestions, and detailed analytics.",
    features: ["SEO Optimization", "Thumbnail AI", "Subscriber Growth"],
  },
  {
    icon: Clock,
    title: "Content Scheduling",
    description: "Schedule posts across all platforms in advance and maintain consistent posting with our intelligent scheduler.",
    features: ["Multi-Platform", "Optimal Timing", "Bulk Scheduling"],
  },
  {
    icon: Zap,
    title: "Real-Time Analytics",
    description: "Get instant insights into your performance with real-time analytics and detailed engagement reports.",
    features: ["Live Tracking", "Detailed Reports", "Competitor Analysis"],
  },
  {
    icon: Users,
    title: "Audience Management",
    description: "Understand and engage with your audience effectively using advanced audience insights and segmentation.",
    features: ["Audience Insights", "Engagement Tools", "Community Management"],
  },
]

export function Services() {
  return (
    <section id="services" className="relative py-20 md:py-32 px-8 md:px-12 bg-white">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-20"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-rose-600 mb-4">06 — SERVICES</p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic text-slate-900">
          Powerful Tools for Your Growth
        </h2>
      </motion.div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative p-8 border border-rose-200 bg-white hover:border-rose-500 transition-all duration-300 cursor-none"
            >
              {/* Icon */}
              <motion.div
                className="w-12 h-12 mb-6 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon className="w-6 h-6 text-rose-600" />
              </motion.div>

              {/* Content */}
              <h3 className="font-sans text-xl font-semibold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="font-sans text-sm text-slate-600 mb-6">{service.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {service.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs font-mono tracking-wider px-3 py-1 border border-rose-300 text-rose-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
