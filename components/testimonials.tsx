"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Influencer & Content Creator",
    image: "SJ",
    quote: "MND helped me grow from 10K to 100K followers in just 3 months. The automation tools saved me countless hours!",
    rating: 5,
  },
  {
    name: "Marcus Chen",
    role: "E-commerce Owner",
    image: "MC",
    quote: "The analytics dashboard is incredibly detailed. I finally understand which content drives sales for my business.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "Agency Manager",
    image: "ER",
    quote: "Managing multiple client accounts is now seamless. MND's platform is a game-changer for agencies like ours.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Personal Brand Coach",
    image: "DK",
    quote: "The best part? The scheduling feature. I can plan a month of content in an hour. Absolutely worth it!",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 md:py-32 px-8 md:px-12 bg-white">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-20 text-center"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-rose-600 mb-4">07 — TESTIMONIALS</p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic text-slate-900">
          Loved by Marketers Worldwide
        </h2>
      </motion.div>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group relative p-8 border border-rose-200 bg-white hover:border-rose-500 transition-all duration-300 cursor-none"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-rose-400 text-rose-400" />
              ))}
            </div>

            {/* Quote */}
            <p className="font-sans text-slate-700 mb-6 italic">"{testimonial.quote}"</p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-2 border-rose-400 flex items-center justify-center text-rose-600 font-bold font-mono text-sm">
                {testimonial.image}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                <p className="font-mono text-xs text-slate-600 tracking-wide">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="grid md:grid-cols-3 gap-8 p-8 border border-rose-200 bg-white text-center"
      >
        <div>
          <h3 className="text-3xl md:text-4xl font-bold text-rose-600 mb-2">50K+</h3>
          <p className="font-mono text-xs text-slate-600 tracking-wider">ACTIVE USERS</p>
        </div>
        <div>
          <h3 className="text-3xl md:text-4xl font-bold text-rose-600 mb-2">10M+</h3>
          <p className="font-mono text-xs text-slate-600 tracking-wider">FOLLOWERS GROWN</p>
        </div>
        <div>
          <h3 className="text-3xl md:text-4xl font-bold text-rose-600 mb-2">4.9★</h3>
          <p className="font-mono text-xs text-slate-600 tracking-wider">AVERAGE RATING</p>
        </div>
      </motion.div>
    </section>
  )
}
