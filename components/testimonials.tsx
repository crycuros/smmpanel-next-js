"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Influencer",
    image: "SJ",
    quote: "MND helped me grow from 10K to 100K followers in just 3 months. Best SMM Panel in PH!",
    rating: 5,
  },
  {
    name: "Marcus Chen",
    role: "E-commerce Owner",
    image: "MC",
    quote: "The dashboard is detailed. I finally understand which content drives sales for my business.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "Reseller",
    image: "ER",
    quote: "Managing multiple client accounts is seamless. MND's platform is perfect for resellers!",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Digital Marketer",
    image: "DK",
    quote: "Great prices and instant delivery. My go-to SMM panel for all my projects!",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-16 md:py-24 lg:py-32 px-4 md:px-8 lg:px-12 bg-white">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-12 md:mb-16 text-center"
      >
        <p className="font-mono text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] text-rose-600 mb-3 md:mb-4">07 — TESTIMONIALS</p>
        <h2 className="font-sans text-2xl md:text-4xl lg:text-5xl font-light italic text-slate-900">
          Loved by Customers
        </h2>
      </motion.div>

      {/* Testimonials Grid */}
      <div className="grid sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-10 md:mb-12">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group relative p-5 md:p-8 border border-rose-200 bg-white hover:border-rose-500 transition-all duration-300"
          >
            {/* Stars */}
            <div className="flex gap-0.5 md:gap-1 mb-3 md:mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-rose-400 text-rose-400" />
              ))}
            </div>

            {/* Quote */}
            <p className="font-sans text-sm md:text-base text-slate-700 mb-4 md:mb-6 italic line-clamp-3">"{testimonial.quote}"</p>

            {/* Author */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-rose-400 flex items-center justify-center text-rose-600 font-bold font-mono text-xs md:text-sm">
                {testimonial.image}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm md:text-base">{testimonial.name}</h4>
                <p className="font-mono text-[10px] md:text-xs text-slate-600 tracking-wide">{testimonial.role}</p>
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
        className="grid grid-cols-3 gap-4 md:gap-8 p-5 md:p-8 border border-rose-200 bg-white text-center"
      >
        <div>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-rose-600 mb-1 md:mb-2">50K+</h3>
          <p className="font-mono text-[8px] md:text-xs text-slate-600 tracking-wider">USERS</p>
        </div>
        <div>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-rose-600 mb-1 md:mb-2">10M+</h3>
          <p className="font-mono text-[8px] md:text-xs text-slate-600 tracking-wider">DELIVERED</p>
        </div>
        <div>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-rose-600 mb-1 md:mb-2">4.9★</h3>
          <p className="font-mono text-[8px] md:text-xs text-slate-600 tracking-wider">RATING</p>
        </div>
      </motion.div>
    </section>
  )
}
