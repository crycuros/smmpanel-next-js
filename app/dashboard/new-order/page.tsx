"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import BrutalistSidebar from "@/components/brutalist-sidebar"
import { useCurrency } from "@/hooks/useCurrency"
import { parseSocialUrl, getPlatformInfo, type ParsedUrl } from "@/lib/url-parser"
import { 
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Link as LinkIcon,
  MessageSquare
} from "lucide-react"
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaTiktok,
  FaTelegram,
  FaDiscord,
  FaSpotify,
  FaReddit,
  FaGithub,
  FaLink,
} from "react-icons/fa"
import { ThreadsIcon, KickIcon, KwaiIcon } from "@/components/custom-icons"

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
  service_type: string
  service_line: number
  api_detail: any
  service_refill?: number
  average_time?: number | null
}

interface OrderStatus {
  pending: number
  processing: number
  inprogress: number
  completed: number
  partial: number
  canceled: number
  total: number
}

interface ServiceStats {
  pending: number
  processing: number
  inprogress: number
  completed: number
  partial: number
  canceled: number
  total: number
}

interface DailyOrder {
  date: string
  count: number
}

// Icon matching based on keywords in category name using FA icons
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase()

  if (name.includes("facebook")) return FaFacebook
  if (name.includes("instagram")) return FaInstagram
  if (name.includes("twitter") || name.includes("x.com")) return FaTwitter
  if (name.includes("youtube")) return FaYoutube
  if (name.includes("linkedin")) return FaLinkedin

  if (name.includes("tiktok")) return FaTiktok
  if (name.includes("telegram")) return FaTelegram
  if (name.includes("discord")) return FaDiscord
  if (name.includes("spotify")) return FaSpotify
  if (name.includes("reddit")) return FaReddit
  if (name.includes("github")) return FaGithub

  // Threads, Kick, Kwai - not in FA, use custom SVG icons
  if (name.includes("threads")) return ThreadsIcon
  if (name.includes("kick")) return KickIcon
  if (name.includes("kwai")) return KwaiIcon

  return FaLink
}

export default function NewOrder() {
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [orderStats, setOrderStats] = useState<OrderStatus>({
    pending: 0,
    processing: 0,
    inprogress: 0,
    completed: 0,
    partial: 0,
    canceled: 0,
    total: 0
  })
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number>(1)
  const [sortByPrice, setSortByPrice] = useState<"default" | "asc" | "desc">("default")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState("")
  const [comments, setComments] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [parsedUrl, setParsedUrl] = useState<ParsedUrl | null>(null)
  const [isExpanding, setIsExpanding] = useState(false)
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null)
  const [serviceStats, setServiceStats] = useState<ServiceStats>({
    pending: 0,
    processing: 0,
    inprogress: 0,
    completed: 0,
    partial: 0,
    canceled: 0,
    total: 0
  })
  const [last7Days, setLast7Days] = useState<DailyOrder[]>([])
  const [avgTime, setAvgTime] = useState<number | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const router = useRouter()
  const { currency, config, convertPrice, formatPrice } = useCurrency()

  const isCustomCommentsService = (service: Service | null) => {
    if (!service) return false;
    const type = service.service_type?.toLowerCase() || '';
    const name = service.service_name?.toLowerCase() || '';
    return type.includes('custom comment') || 
           type.includes('mentions custom list') || 
           name.includes('custom comment');
  }

  // Handle link change with URL parsing
  const handleLinkChange = async (value: string) => {
    setLink(value)
    setExpandedUrl(null)
    setIsExpanding(false)
    
    if (value.trim()) {
      const parsed = parseSocialUrl(value)
      setParsedUrl(parsed)
      
      // Check if URL needs expansion or has tracking params
      let urlToPreview = value
      
      if (parsed.needsExpansion || value.includes('utm_') || value.includes('igsh=') || value.includes('fbclid')) {
        setIsExpanding(true)
        try {
          const response = await fetch('/api/expand-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: value })
          })
          const data = await response.json()
          
          if (data.originalUrl && (data.expanded || data.cleaned) && data.originalUrl !== value) {
            setExpandedUrl(data.originalUrl)
            setLink(data.originalUrl)
            setParsedUrl(parseSocialUrl(data.originalUrl))
            urlToPreview = data.originalUrl
          }
        } catch (err) {
          console.error('Error processing URL:', err)
        }
        setIsExpanding(false)
      }
    } else {
      setParsedUrl(null)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      fetchData(userData.client_id)
    } else {
      router.push('/signin')
    }
  }, [router])

  const fetchData = async (clientId: number) => {
    setLoadingData(true)
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('category_line', { ascending: true })
      
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData)
        setSelectedCategory(categoriesData[0].category_id)
      }

      // Fetch services with pagination
      const pageSize = 1000
      let allServices: any[] = []
      let from = 0
      let hasMore = true
      
      while (hasMore) {
        const { data: servicesPage, error: svcErr } = await supabase
          .from('services')
          .select('*')
          .order('service_id', { ascending: true })
          .range(from, from + pageSize - 1)
        
        if (svcErr) {
          console.error('Services fetch error:', svcErr)
          break
        }
        
        if (servicesPage && servicesPage.length > 0) {
          allServices = [...allServices, ...servicesPage]
          from += pageSize
          hasMore = servicesPage.length === pageSize
        } else {
          hasMore = false
        }
      }
      
      if (allServices.length > 0) {
        setServices(allServices)
      }

      // Fetch order stats for this user
      const { data: ordersData } = await supabase
        .from('orders')
        .select('order_status')
        .eq('client_id', clientId)

      if (ordersData) {
        const stats: OrderStatus = {
          pending: 0,
          processing: 0,
          inprogress: 0,
          completed: 0,
          partial: 0,
          canceled: 0,
          total: ordersData.length
        }
        
        ordersData.forEach((order: any) => {
          const status = order.order_status as keyof OrderStatus
          if (stats[status] !== undefined) {
            stats[status]++
          }
        })
        
        setOrderStats(stats)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  // Fetch service statistics (average time and order counts)
  const fetchServiceStats = useCallback(async (serviceId: number) => {
    setLoadingStats(true)
    try {
      // First, try to get cached average time
      const { data: servicesData } = await supabase
        .from('services')
        .select('average_time')
        .eq('service_id', serviceId)
        .single()

      if (servicesData?.average_time) {
        setAvgTime(servicesData.average_time)
      }

      // Get order stats from API
      const response = await fetch(`/api/service-stats?serviceId=${serviceId}`)
      const data = await response.json()

      if (data.averageTime) {
        setAvgTime(data.averageTime)
      }
      if (data.stats) {
        setServiceStats(data.stats)
      }
      if (data.last7Days) {
        setLast7Days(data.last7Days)
      }
    } catch (error) {
      console.error('Error fetching service stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const filteredServices = services
    .filter(service => 
      service.category_id === selectedCategory &&
      service.service_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortByPrice === "asc") {
        return parseFloat(a.service_price) - parseFloat(b.service_price)
      } else if (sortByPrice === "desc") {
        return parseFloat(b.service_price) - parseFloat(a.service_price)
      }
      // Default: sort by service_line (original order)
      return a.service_line - b.service_line
    })



  const calculateCharge = () => {
    if (!selectedService || !quantity) return "0.00"
    const qty = parseInt(quantity) || 0
    const price = parseFloat(selectedService.service_price) || 0
    return (qty * price / 1000).toFixed(2)
  }

  // Calculate charge in user's currency for display
  const calculateChargeDisplay = () => {
    const phpCharge = parseFloat(calculateCharge())
    return formatPrice(phpCharge)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !link || !quantity) return
    
    setIsLoading(true)
    try {
      const payload: any = {
        service: selectedService.service_id,
        link: link,
        quantity: parseInt(quantity),
      }
      
      if (isCustomCommentsService(selectedService) && comments.trim()) {
        payload.comments = comments.trim()
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order')
      }

      // Update local storage with new balance from API
      if (data.local_balance !== undefined) {
        const updatedUser = { ...user, balance: data.local_balance.toString() }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }

      alert(`Order placed successfully! Order ID: ${data.order}`)
      router.push('/dashboard/orders')
    } catch (error: any) {
      console.error('Error placing order:', error)
      alert(error.message || "Failed to place order. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-pink-50/30 to-rose-50/50">
        <div className="text-center">
          <Loader2 size={40} className="text-rose-500 animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm text-slate-500">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/30 to-rose-50/50">
      <BrutalistSidebar />
      
      <div className="p-6 md:p-8 pt-20 pb-24 md:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-sans text-3xl md:text-4xl font-light text-slate-900 mb-2">
            Welcome To <span className="italic text-rose-500 font-semibold">MND</span>
          </h1>
          <p className="font-mono text-sm text-slate-500">Place your order below</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl p-4 border border-rose-100">
            <p className="font-mono text-xs text-slate-500 uppercase">Total Spend</p>
            <p className="font-sans text-xl font-semibold text-slate-900">{formatPrice(parseFloat(user.spent || '0'))}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-rose-100">
            <p className="font-mono text-xs text-slate-500 uppercase">Total Orders</p>
            <p className="font-sans text-xl font-semibold text-slate-900">{orderStats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-rose-100">
            <p className="font-mono text-xs text-slate-500 uppercase">Total Balance</p>
            <p className="font-sans text-xl font-semibold text-rose-500">{formatPrice(parseFloat(user.balance || '0'))}</p>
          </div>
        </motion.div>

        {/* Search and Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          {/* Search and Sort */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-rose-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>
            <button
              type="button"
              onClick={() => setSortByPrice(prev => prev === "asc" ? "desc" : prev === "desc" ? "default" : "asc")}
              className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                sortByPrice === "default" 
                  ? "bg-white border-rose-200 text-slate-600 hover:border-rose-300"
                  : sortByPrice === "asc"
                    ? "bg-rose-500 border-rose-500 text-white"
                    : "bg-rose-500 border-rose-500 text-white"
              }`}
              title="Sort by price"
            >
              {sortByPrice === "default" ? <ArrowUpDown size={18} /> : sortByPrice === "asc" ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
              <span className="font-mono text-xs hidden sm:inline">
                {sortByPrice === "default" ? "Sort" : sortByPrice === "asc" ? "Low-High" : "High-Low"}
              </span>
            </button>
          </div>

          {/* Custom Category Dropdown */}
          <div className="relative mb-4">
            <label className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-2 block">Select Category</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const dropdown = document.getElementById('category-dropdown')
                  dropdown?.classList.toggle('hidden')
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-rose-200 rounded-xl font-mono text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all hover:border-rose-300"
              >
                <span className="flex items-center gap-2">
                  {(() => {
                    const selectedCat = categories.find(c => c.category_id === selectedCategory)
                    const Icon = selectedCat ? getCategoryIcon(selectedCat.category_name) : Facebook
                    return <Icon size={18} className="text-rose-500" />
                  })()}
                  <span className="text-slate-700">
                    {categories.find(c => c.category_id === selectedCategory)?.category_name || 'Select Category'}
                  </span>
                </span>
                <svg className="w-5 h-5 text-rose-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div id="category-dropdown" className="hidden absolute z-50 w-full mt-2 bg-white border-2 border-rose-200 rounded-xl shadow-xl shadow-rose-500/10 max-h-72 overflow-y-auto">
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.category_name)
                  const serviceCount = services.filter(s => s.category_id === cat.category_id).length
                  return (
                    <button
                      type="button"
                      key={cat.category_id}
                      onClick={() => {
                        setSelectedCategory(cat.category_id)
                        setSelectedService(null)
                        document.getElementById('category-dropdown')?.classList.add('hidden')
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 font-mono text-sm hover:bg-rose-50 transition-all border-b border-rose-50 last:border-b-0 ${
                        selectedCategory === cat.category_id 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'text-slate-600'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} className={selectedCategory === cat.category_id ? 'text-rose-600' : 'text-slate-400'} />
                        {cat.category_name}
                      </span>
                      <span className={`text-xs font-semibold ${selectedCategory === cat.category_id ? 'text-rose-600' : 'text-slate-400'}`}>
                        {serviceCount}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Services and Details Layout - Only show details panel, services moved to modal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Services List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <button
              key={service.service_id}
              onClick={() => setSelectedService(service)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedService?.service_id === service.service_id
                  ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30"
                  : "bg-white border-rose-100 hover:border-rose-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-sm font-semibold">{service.service_name}</p>
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
              <div className="flex justify-between items-center">
                <span className={`font-mono text-xs ${selectedService?.service_id === service.service_id ? "text-rose-100" : "text-slate-500"}`}>
                  {formatPrice(parseFloat(service.service_price))} / 1k
                </span>
                <span className={`font-mono text-xs ${selectedService?.service_id === service.service_id ? "text-rose-100" : "text-slate-400"}`}>
                  Min: {service.min_order} - Max: {service.service_max}
                </span>
              </div>
            </button>
          ))}
          </motion.div>
          
          {/* Service Details Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
          {selectedService ? (
            <div className="bg-white rounded-2xl border border-rose-100 p-6 sticky top-4">
              <h3 className="font-mono text-sm text-rose-600 uppercase tracking-wider mb-4">Service Details</h3>
              
              <div className="mb-4">
                <h4 className="font-sans text-xl font-semibold text-slate-900 mb-2">{selectedService.service_name}</h4>
                <div className="flex items-center gap-2">
                  {selectedService.service_refill === 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 text-slate-500">No Refill</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-100 text-blue-700">↺ Refill Available</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-rose-50">
                  <span className="font-mono text-xs text-slate-500">Price</span>
                  <span className="font-mono text-sm font-semibold text-rose-600">{formatPrice(parseFloat(selectedService.service_price))} / 1k</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-rose-50">
                  <span className="font-mono text-xs text-slate-500">Minimum</span>
                  <span className="font-mono text-sm text-slate-700">{selectedService.min_order}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-rose-50">
                  <span className="font-mono text-xs text-slate-500">Maximum</span>
                  <span className="font-mono text-sm text-slate-700">{selectedService.max_order.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-rose-50">
                  <span className="font-mono text-xs text-slate-500">Category</span>
                  <span className="font-mono text-sm text-slate-700">{categories.find(c => c.category_id === selectedService.category_id)?.category_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-rose-50">
                  <span className="font-mono text-xs text-slate-500">Service ID</span>
                  <span className="font-mono text-sm text-slate-700">{selectedService.service_id}</span>
                </div>
                {/* Average Completion Time */}
                <div className="flex justify-between items-center py-2 border-b border-rose-50">
                  <span className="font-mono text-xs text-slate-500">Avg. Completion</span>
                  <span className="font-mono text-sm font-semibold text-green-600">
                    {loadingStats ? (
                      <span className="flex items-center gap-1">
                        <Loader2 size={14} className="animate-spin" />
                        Calculating...
                      </span>
                    ) : avgTime ? (
                      avgTime < 60 
                        ? `${avgTime} min`
                        : `${Math.floor(avgTime / 60)}h ${avgTime % 60}m`
                    ) : (
                      <span className="text-slate-400">No data</span>
                    )}
                  </span>
                </div>
              </div>
              
              {selectedService.api_detail && (
                <div className="mb-4">
                  <h5 className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-2">API Details</h5>
                  <pre className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600 overflow-x-auto">
                    {JSON.stringify(selectedService.api_detail, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="bg-rose-50 rounded-xl p-4">
                <p className="font-mono text-xs text-rose-600 mb-2">💡 Pro Tips</p>
                <ul className="font-mono text-xs text-slate-600 space-y-1">
                  <li>• Most orders start in 1-15 minutes</li>
                  <li>• Larger orders may take 1-24 hours</li>
                  <li>• Check order status in your dashboard</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-rose-100 p-6 text-center sticky top-4">
              <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-200">
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                </svg>
              </div>
              <p className="font-mono text-sm text-slate-500 mb-2">Select a service to view details</p>
              <p className="font-mono text-xs text-slate-400">Choose from the list on the left</p>
            </div>
          )}
        </motion.div>
        </div>
        
        {/* Service Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-rose-100 p-6 mb-8">
          <h2 className="font-mono text-sm text-slate-500 uppercase tracking-wider mb-4">Service Dashboard</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { label: "Pending", value: orderStats.pending, color: "text-yellow-500" },
              { label: "Processing", value: orderStats.processing, color: "text-blue-500" },
              { label: "Inprogress", value: orderStats.inprogress, color: "text-blue-400" },
              { label: "Completed", value: orderStats.completed, color: "text-green-500" },
              { label: "Partial", value: orderStats.partial, color: "text-orange-500" },
              { label: "Canceled", value: orderStats.canceled, color: "text-red-500" },
              { label: "Total", value: orderStats.total, color: "text-slate-900" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`font-mono text-lg font-semibold ${stat.color}`}>{stat.value}</p>
                <p className="font-mono text-[10px] text-slate-400 uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Service Analytics */}
        {selectedService && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-rose-100 p-6 mb-8"
          >
            <h2 className="font-mono text-sm text-slate-500 uppercase tracking-wider mb-4">Service Analytics</h2>
            
            {/* Average Time Badge */}
            <div className="flex items-center justify-between mb-6 p-4 bg-green-50 rounded-xl border border-green-100">
              <div>
                <p className="font-mono text-xs text-green-600 uppercase tracking-wider">Average Completion Time</p>
                <p className="font-sans text-2xl font-bold text-green-700">
                  {loadingStats ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={24} className="animate-spin" />
                      Calculating...
                    </span>
                  ) : avgTime ? (
                    avgTime < 60 
                      ? `${avgTime} min`
                      : `${Math.floor(avgTime / 60)}h ${avgTime % 60}m`
                  ) : (
                    <span className="text-slate-400 text-lg">Not enough data</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-green-600">Total Orders</p>
                <p className="font-sans text-xl font-bold text-green-700">{serviceStats.total}</p>
              </div>
            </div>
            
            {/* Orders Graph - Bar Chart */}
            <div className="mb-6">
              <h3 className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-4">Orders (Last 7 Days)</h3>
              {last7Days.length > 0 ? (
                <div className="flex items-end justify-between gap-2 h-32">
                  {last7Days.map((day, index) => {
                    const maxCount = Math.max(...last7Days.map(d => d.count), 1)
                    const height = (day.count / maxCount) * 100
                    const date = new Date(day.date)
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                    
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center">
                        <div className="relative w-full flex-1 flex items-end">
                          <div 
                            className="w-full bg-gradient-to-t from-rose-400 to-rose-300 rounded-t-md transition-all duration-500"
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                        </div>
                        <p className="font-mono text-[10px] text-slate-500 mt-2">{dayName}</p>
                        <p className="font-mono text-[10px] text-slate-400">{day.count}</p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-slate-400">
                  <p className="font-mono text-sm">No order data available</p>
                </div>
              )}
            </div>
            
            {/* Order Status Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Pending", value: serviceStats.pending, color: "bg-yellow-500" },
                { label: "Processing", value: serviceStats.processing, color: "bg-blue-500" },
                { label: "Completed", value: serviceStats.completed, color: "bg-green-500" },
                { label: "Partial", value: serviceStats.partial, color: "bg-orange-500" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                  <div>
                    <p className="font-mono text-lg font-semibold text-slate-700">{stat.value}</p>
                    <p className="font-mono text-[10px] text-slate-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Order Form */}
        {selectedService && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-rose-100 p-6"
          >
            <h2 className="font-mono text-sm text-slate-500 uppercase tracking-wider mb-6">New Order</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono text-xs text-slate-500 uppercase block mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Link
                </label>
                <input
                  type="text"
                  placeholder="Paste your social media link here..."
                  value={link}
                  onChange={(e) => handleLinkChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-rose-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
                
                {/* URL Preview Card */}
                {isExpanding && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-4 rounded-xl border bg-blue-50 border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <div>
                        <p className="text-sm font-mono text-blue-700">Expanding share link...</p>
                        <p className="text-xs font-mono text-blue-500">Converting to original post URL</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {parsedUrl && !isExpanding && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`mt-3 p-4 rounded-xl border ${
                      parsedUrl.isValid
                        ? 'bg-green-50 border-green-200'
                        : parsedUrl.needsExpansion
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {parsedUrl.isValid ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : parsedUrl.needsExpansion ? (
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold text-white ${
                            getPlatformInfo(parsedUrl.platform).color
                          }`}>
                            {getPlatformInfo(parsedUrl.platform).name}
                          </span>
                          {parsedUrl.isValid ? (
                            <span className="text-xs font-mono text-green-700">Valid URL</span>
                          ) : parsedUrl.needsExpansion ? (
                            <span className="text-xs font-mono text-amber-700">Share link - use original link</span>
                          ) : (
                            <span className="text-xs font-mono text-red-700">{parsedUrl.error}</span>
                          )}
                          {expandedUrl && (
                            <span className="text-xs font-mono text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Auto-expanded ✓</span>
                          )}
                        </div>
                        {parsedUrl.username && (
                          <p className="text-xs font-mono text-slate-600 truncate">
                            @{parsedUrl.username}
                          </p>
                        )}
                        {parsedUrl.postId && (
                          <p className="text-xs font-mono text-slate-500 truncate">
                            Post ID: {parsedUrl.postId}
                          </p>
                        )}
                        {parsedUrl.needsExpansion && (
                          <div className="text-[10px] font-mono text-amber-700 mt-2">
                            <p>⚠️ Share link detected - attempting auto-expand...</p>
                          </div>
                        )}
                        {!parsedUrl.needsExpansion && (
                          <p className="text-[10px] font-mono text-slate-400 mt-2">
                            Examples: {getPlatformInfo(parsedUrl.platform).examples}
                          </p>
                        )}
                      </div>
                      {parsedUrl.isValid && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-500 hover:text-rose-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
              
              {isCustomCommentsService(selectedService) && (
                <div>
                  <label className="font-mono text-xs text-slate-500 uppercase block mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    {selectedService.service_type?.toLowerCase().includes('mention') ? 'Custom List' : 'Comments'} <span className="text-slate-400">(one per line)</span>
                  </label>
                  <textarea
                    placeholder={selectedService.service_type?.toLowerCase().includes('mention')
                      ? "Enter usernames/hashtags here, one per line...\n\nExample:\n@user1\n@user2\n#hashtag1"
                      : "Enter your comments here, one per line...\n\nExample:\nGreat post!\nLove this content!\nKeep it up!"}
                    value={comments}
                    onChange={(e) => {
                      setComments(e.target.value)
                      // Auto-update quantity based on lines
                      const lines = e.target.value.split('\n').filter(line => line.trim() !== '')
                      if (lines.length > 0) {
                        setQuantity(lines.length.toString())
                      }
                    }}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-rose-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
                  />
                  <p className="text-[10px] font-mono text-slate-400 mt-1">Each line = one item. Quantity will auto-update based on lines.</p>
                </div>
              )}
              
              <div>
                <label className="font-mono text-xs text-slate-500 uppercase block mb-2">
                  Quantity <span className="text-slate-400">Min: {selectedService.min_order} - Max: {selectedService.max_order}</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min={selectedService.min_order}
                  max={selectedService.max_order}
                  required
                  readOnly={isCustomCommentsService(selectedService)}
                  className={`w-full px-4 py-3 bg-slate-50 border border-rose-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${isCustomCommentsService(selectedService) ? 'opacity-75 cursor-not-allowed' : ''}`}
                />
              </div>
              <div className="bg-rose-50 rounded-xl p-4 flex justify-between items-center">
                <span className="font-mono text-sm text-slate-600">Charge</span>
                <span className="font-mono text-xl font-bold text-rose-500">{calculateChargeDisplay()}</span>
              </div>
              <button
                type="submit"
                disabled={isLoading || !link || !quantity || parseFloat(user.balance || '0') <= 0}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-mono font-semibold transition-all hover:shadow-lg hover:shadow-rose-500/30 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : parseFloat(user.balance || '0') <= 0 ? (
                  "Insufficient Balance"
                ) : (
                  <>
                    New Order
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}
