"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Star } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface SMMService {
  service_id: number
  service_name: string
  service_price: string
  service_min: string
  service_max: string
  category_name: string
}

export function Services() {
  const [services, setServices] = useState<SMMService[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        // Fetch services from Supabase
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .order('service_id', { ascending: false })
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('category_id, category_name')
          .order('category_id', { ascending: true })
        
        if (servicesError) {
          console.error('Services fetch error:', servicesError)
        }
        
        if (categoriesError) {
          console.error('Categories fetch error:', categoriesError)
        }
        
        if (servicesData && categoriesData) {
          // Map category names to services
          const categoryMap = new Map(categoriesData.map((c: any) => [c.category_id, c.category_name]))
          const servicesWithCategory = servicesData.map((service: any) => ({
            ...service,
            category_name: categoryMap.get(service.category_id) || 'Uncategorized'
          }))
          // Take first 12 services as popular
          setServices(servicesWithCategory.slice(0, 12))
        }
      } catch (err) {
        console.error('Failed to fetch services:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

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
        </h2>
      </motion.div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.service_id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative p-5 md:p-8 border border-rose-200 bg-white hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-300 cursor-pointer"
              whileTap={{ scale: 0.98 }}
            >
              {/* Service Icon */}
              <motion.div
                className="w-10 h-12 md:h-12 mb-4 md:mb-6 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Star className="w-5 h-5 md:w-6 md:h-6 text-rose-600 group-hover:text-rose-700 transition-colors" />
              </motion.div>

              {/* Content */}
              <h3 className="font-sans text-lg md:text-xl font-semibold text-slate-900 mb-2 md:mb-3 group-hover:text-rose-600 transition-colors duration-300">
                {service.service_name}
              </h3>
              <p className="font-sans text-sm text-slate-600 mb-4 md:mb-6 line-clamp-2">
                {service.category_name}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-1 md:gap-2">
                <span className="text-[10px] md:text-xs font-mono tracking-wider px-2 py-1 md:px-3 md:py-1 border border-rose-300 text-rose-700 group-hover:border-rose-500 group-hover:bg-rose-100 transition-colors">
                  ₱{service.service_price}/1k
                </span>
                <span className="text-[10px] md:text-xs font-mono tracking-wider px-2 py-1 md:px-3 md:py-1 border border-rose-300 text-rose-700 group-hover:border-rose-500 group-hover:bg-rose-100 transition-colors">
                  Min: {service.service_min}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
