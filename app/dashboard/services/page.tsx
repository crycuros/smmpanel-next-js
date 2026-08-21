"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import BrutalistSidebar from "@/components/brutalist-sidebar"
import { useCurrency } from "@/hooks/useCurrency"
import { 
  Search,
  Filter,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Sparkles,
  ChevronDown,
  Info,
  RefreshCw,
  ArrowDown
} from "lucide-react"

interface Category {
  category_id: number
  category_name: string
  category_line: number
}

interface Service {
  service_id: number
  service_name: string
  category_id: number
  service_price: string
  min_order: number
  max_order: number
  service_line: number
  service_desc: string
  time: string
  average_time: number
  service_refill?: number
}

const categoryIcons: Record<string, any> = {
  "Facebook Reactions": Facebook,
  "Facebook Followers": Facebook,
  "Facebook Likes": Facebook,
  "Facebook Comments": Facebook,
  "Instagram Followers": Instagram,
  "Instagram Likes": Instagram,
  "Twitter Followers": Twitter,
  "Twitter Likes": Twitter,
  "YouTube Views": Youtube,
  "YouTube Likes": Youtube,
  "TikTok Followers": Sparkles,
  "TikTok Likes": Sparkles,
}

export default function Services() {
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all")
  const [expandedService, setExpandedService] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string>("")
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 })
  const router = useRouter()
  const { currency, config, isLoading: currencyLoading, convertPrice, formatPrice } = useCurrency()
  
  // Pull-to-refresh state
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      fetchData()
    } else {
      router.push('/signin')
    }
  }, [router])

  const handleRefresh = async () => {
    setIsSyncing(true)
    setSyncProgress({ current: 0, total: 0 })
    setSyncMessage("Updating Services 0/...")
    try {
      // Use smart sync to only update changed services
      const apiKey = process.env.NEXT_PUBLIC_SMM_API_KEY
      const apiUrl = process.env.NEXT_PUBLIC_SMM_API_URL
      
      if (apiKey && apiUrl) {
        setSyncMessage("Fetching services...")
        const response = await fetch('/api/smart-sync-services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey, apiUrl })
        })
        const data = await response.json()
        
        if (data.success) {
          const total = data.stats?.updatedCount + data.stats?.insertedCount || 0
          setSyncProgress({ current: total, total })
          setSyncMessage(`Updating Services ${total}/${total}`)
          setSyncMessage(data.message || "Services updated!")
        } else {
          setSyncMessage(data.error || "Sync failed")
        }
      }
    } catch (err) {
      console.error('Smart sync error:', err)
      setSyncMessage("Sync failed")
    }
    
    await fetchData()
    setIsSyncing(false)
    setSyncProgress({ current: 0, total: 0 })
    setTimeout(() => setSyncMessage(""), 3000)
  }

  // Pull-to-refresh handlers - more sensitive for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    // Enable pull-to-refresh when near the top of the page
    if (window.scrollY <= 10) {
      touchStartY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === 0) return
    
    const currentY = e.touches[0].clientY
    const diff = currentY - touchStartY.current
    
    // Only allow pulling down (not up) and when near top
    if (diff > 0 && window.scrollY <= 10) {
      // Cap the pull distance at 80px
      setPullDistance(Math.min(diff * 0.6, 80))
      setIsPulling(true)
    }
  }

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance > 30) {
      // Trigger refresh if pulled down more than 30px
      await handleRefresh()
    }
    
    // Reset state
    setIsPulling(false)
    setPullDistance(0)
    touchStartY.current = 0
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // First try to fetch from Supabase
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('category_line', { ascending: true })
      
      console.log('Categories response:', { data: categoriesData, error: catError })
      
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData)
      }

      // Fetch services with pagination to get all 1754+ services
      const pageSize = 1000
      let allServices: any[] = []
      let from = 0
      let hasMore = true
      
      while (hasMore) {
        const { data: servicesPage, error: svcError } = await supabase
          .from('services')
          .select('*')
          .order('service_id', { ascending: true })
          .range(from, from + pageSize - 1)
        
        if (servicesPage && servicesPage.length > 0) {
          allServices = [...allServices, ...servicesPage]
          from += pageSize
          hasMore = servicesPage.length === pageSize
        } else {
          hasMore = false
        }
      }
      
      const servicesData = allServices
      console.log('Services response:', { count: servicesData?.length })
      
      // If Supabase has data, use it
      if (servicesData && servicesData.length > 0) {
        setServices(servicesData)
        setFilteredServices(servicesData)
        // Also refresh categories from external if needed
        if (!categoriesData || categoriesData.length === 0) {
          await fetchFromExternalAPI()
        }
      } else {
        // Fallback: Fetch from external SMM API
        console.log('Supabase empty, fetching from external API...')
        await fetchFromExternalAPI()
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      // Try external API as fallback
      await fetchFromExternalAPI()
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFromExternalAPI = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_SMM_API_KEY
      const apiUrl = process.env.NEXT_PUBLIC_SMM_API_URL
      
      if (!apiKey || !apiUrl) {
        console.error('API not configured')
        return
      }
      
      console.log('Fetching from server-side API...')
      
      // Use server-side API to bypass CORS
      const response = await fetch('/api/sync-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, apiUrl })
      })
      const data = await response.json()
      
      console.log('Server API response:', data)
      
      if (data.error) {
        console.error('API error:', data.error)
        return
      }
      
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories)
      }
      
      if (data.services && Array.isArray(data.services)) {
        const transformedServices: Service[] = data.services.map((item: any) => ({
          service_id: item.service_id,
          service_name: item.service_name,
          category_id: item.category_id,
          service_price: item.service_price,
          min_order: item.min_order,
          max_order: item.max_order,
          service_line: item.service_line,
          service_desc: item.service_desc || '',
          time: 'N/A',
          average_time: 0,
          service_refill: item.service_refill
        }))
        
        setServices(transformedServices)
        setFilteredServices(transformedServices)
        console.log('Loaded', transformedServices.length, 'services from API')
      }
    } catch (error) {
      console.error('Error fetching from external API:', error)
    }
  }

  useEffect(() => {
    let result = [...services]

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(service => service.category_id === selectedCategory)
    }

    // Filter by search
    if (search) {
      result = result.filter(service => 
        service.service_id.toString().includes(search) ||
        service.service_name.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredServices(result)
  }, [services, search, selectedCategory])

  const getCategoryIcon = (categoryId: number) => {
    const category = categories.find(c => c.category_id === categoryId)
    if (category) {
      return categoryIcons[category.category_name] || Info
    }
    return Info
  }

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.category_id === categoryId)
    return category?.category_name || 'Unknown'
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-white via-pink-50/30 to-rose-50/50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={contentRef}
    >
      <BrutalistSidebar />
      
      {/* Pull-to-refresh indicator */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 transition-transform duration-200"
        style={{ 
          transform: isPulling || isSyncing ? 'translateY(0)' : 'translateY(-60px)',
          paddingTop: '60px'
        }}
      >
        <div className="bg-rose-500 text-white text-center py-2 font-mono text-sm flex items-center justify-center gap-2">
          {isSyncing ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              {syncMessage || 'Updating Services...'}
            </>
          ) : (
            <>
              <ArrowDown size={16} />
              Pull down to sync
            </>
          )}
        </div>
      </div>

      {/* Sync message toast */}
      {syncMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded-xl font-mono text-sm shadow-lg">
          {syncMessage}
        </div>
      )}
      
      <div className="p-4 md:p-8 pt-16 md:pt-20 pb-20 md:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-sans text-2xl md:text-4xl font-light text-slate-900 mb-2">
            Our <span className="italic text-rose-500 font-semibold">Services</span>
          </h1>
          <p className="font-mono text-xs md:text-sm text-slate-500">Browse all available services and rates</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
            <button
              onClick={handleRefresh}
              disabled={isSyncing}
              className="px-3 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-xl font-mono text-xs md:text-sm transition-colors flex items-center gap-2 w-full sm:w-auto"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Refresh'}
            </button>
            <span className="font-mono text-xs text-slate-400">
              Swipe down to sync
            </span>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 md:py-3 bg-white border border-rose-100 rounded-xl font-mono text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl font-mono text-sm whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                  : "bg-white text-slate-600 border border-rose-100 hover:bg-rose-50"
              }`}
            >
              All Services
            </button>
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.category_id)
              return (
                <button
                  key={cat.category_id}
                  onClick={() => setSelectedCategory(cat.category_id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm whitespace-nowrap transition-all ${
                    selectedCategory === cat.category_id
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                      : "bg-white text-slate-600 border border-rose-100 hover:bg-rose-50"
                  }`}
                >
                  <Icon size={16} />
                  {cat.category_name}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Services Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-rose-100 overflow-hidden"
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-mono text-sm text-slate-500">Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-mono text-lg text-slate-500 mb-2">No services found</p>
              <p className="font-mono text-sm text-slate-400">Try a different search or category</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-rose-50 border-b border-rose-100">
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">ID</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Service</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Rate for 1000</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Min / Max</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Average Time</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((service, index) => {
                    const Icon = getCategoryIcon(service.category_id)
                    const isExpanded = expandedService === service.service_id
                    
                    return (
                      <>
                        <tr 
                          key={service.service_id} 
                          className="border-b border-rose-50 hover:bg-rose-50/30 transition-colors cursor-pointer"
                          onClick={() => setExpandedService(isExpanded ? null : service.service_id)}
                        >
                          <td className="p-4">
                            <span className="font-mono text-sm font-semibold text-slate-900">{service.service_id}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                                <Icon size={16} className="text-rose-500" />
                              </div>
                              <div className="flex-1">
                                <span className="font-mono text-sm text-slate-700 line-clamp-2">{service.service_name}</span>
                                {/* Refill Indicator */}
                                {service.service_refill === 0 ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 text-slate-500">
                                    No Refill
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-100 text-blue-700">
                                    ↺ Refill
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-sm font-semibold text-rose-500">{formatPrice(parseFloat(service.service_price))} / 1k</span>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-sm text-slate-600">
                              {service.min_order.toLocaleString()} / {service.max_order.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-xs text-slate-500">
                              {service.time || 'Not enough data'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-500 line-clamp-1">
                                {service.service_desc || 'No description'}
                              </span>
                              <ChevronDown 
                                size={16} 
                                className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${service.service_id}-expanded`} className="bg-rose-50/30">
                            <td colSpan={6} className="p-4">
                              <div className="bg-white rounded-xl p-4 border border-rose-100">
                                <h4 className="font-mono text-sm font-semibold text-slate-900 mb-2">Service Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-mono text-xs text-slate-500 mb-1">Category</p>
                                    <p className="font-mono text-slate-700">{getCategoryName(service.category_id)}</p>
                                  </div>
                                  <div>
                                    <p className="font-mono text-xs text-slate-500 mb-1">Minimum Order</p>
                                    <p className="font-mono text-slate-700">{service.min_order.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="font-mono text-xs text-slate-500 mb-1">Maximum Order</p>
                                    <p className="font-mono text-slate-700">{service.max_order.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="font-mono text-xs text-slate-500 mb-1">Average Completion Time</p>
                                    <p className="font-mono text-slate-700">{service.time || 'Not enough data'}</p>
                                  </div>
                                  <div className="md:col-span-2">
                                    <p className="font-mono text-xs text-slate-500 mb-1">Description</p>
                                    <p className="font-mono text-slate-700">{service.service_desc || 'No description available'}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Service Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="font-mono text-sm text-slate-500">
            Showing {filteredServices.length} of {services.length} services
          </p>
        </motion.div>
      </div>
    </div>
  )
}
