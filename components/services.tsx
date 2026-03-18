"use client"

import { motion } from "framer-motion"
import { Instagram, TrendingUp, BarChart3, Clock, Zap, Users } from "lucide-react"

const services = [
  {
    icon: Instagram,
    title: "Instagram Followers",
    description: "Get instant Instagram followers at the best prices in the Philippines. Real and active followers delivered fast.",
    features: ["Instant Delivery", "Best Prices", "24/7 Support"],
  },
  {
    icon: TrendingUp,
    title: "TikTok Views & Followers",
    description: "Boost your TikTok presence with affordable views, likes, and followers. Go viral with our SMM services.",
    features: ["Fast Delivery", "Bulk Orders", "Competitive Rates"],
  },
  {
    icon: BarChart3,
    title: "YouTube Services",
    description: "Get more YouTube subscribers, views, and engagement. Best SMM Panel for YouTube growth in PH.",
    features: ["Real Views", "Subscriber Growth", "Monetization Ready"],
  },
  {
    icon: Clock,
    title: "Facebook Services",
    description: "Increase your Facebook page likes, followers, and engagement. Instant delivery with best rates.",
    features: ["Page Likes", "Post Engagement", "Followers"],
  },
  {
    icon: Zap,
    title: "Twitter/X Services",
    description: "Get Twitter followers, retweets, and likes. Grow your Twitter presence with our affordable SMM panel.",
    features: ["Followers", "Retweets", "Likes"],
  },
  {
    icon: Users,
    title: "All Social Networks",
    description: "Complete SMM Panel services for all major social media platforms. One panel for all your needs.",
    features: ["Multi Platform", "API Access", "Reseller Tools"],
  },
]

export function Services() {
  return (
    <section id="services" className="relative py-16 md:py-24 lg:py-32 px-4 md:px-8 lg:px-12 bg-white">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-12 md:mb-20"
      >
        <p className="font-mono text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] text-rose-600 mb-3 md:mb-4">06 — SMM SERVICES</p>
        <h2 className="font-sans text-2xl md:text-4xl lg:text-5xl font-light italic text-slate-900">
          Best SMM Panel Services
        </h2>
      </motion.div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative p-5 md:p-8 border border-rose-200 bg-white hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-300 cursor-pointer"
              // Touch-friendly: activate hover state on touch
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <motion.div
                className="w-10 h-12 md:h-12 mb-4 md:mb-6 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-rose-600 group-hover:text-rose-700 transition-colors" />
              </motion.div>

              {/* Content */}
              <h3 className="font-sans text-lg md:text-xl font-semibold text-slate-900 mb-2 md:mb-3 group-hover:text-rose-600 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="font-sans text-sm text-slate-600 mb-4 md:mb-6 line-clamp-3">{service.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-1 md:gap-2">
                {service.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-[10px] md:text-xs font-mono tracking-wider px-2 py-1 md:px-3 md:py-1 border border-rose-300 text-rose-700 group-hover:border-rose-500 group-hover:bg-rose-100 transition-colors"
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
