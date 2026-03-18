"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import BrutalistSidebar from "@/components/brutalist-sidebar"
import { useCurrency } from "@/hooks/useCurrency"
import { parseSocialUrl, getPlatformInfo, type ParsedUrl } from "@/lib/url-parser"
import { 
  Search,
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
  Link as LinkIcon
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
  service_min: number
  service_max: number
  service_line: number
  api_detail: any
  service_refill?: string
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
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [parsedUrl, setParsedUrl] = useState<ParsedUrl | null>(null)
  const [isExpanding, setIsExpanding] = useState(false)
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null)
  const router = useRouter()
  const { currency, config, convertPrice, formatPrice } = useCurrency()

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

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('service_line', { ascending: true })
      
      if (servicesData) {
        setServices(servicesData)
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const filteredServices = services.filter(service => 
    service.category_id === selectedCategory &&
    service.service_name.toLowerCase().includes(search.toLowerCase())
  )

  const getCategoryIcon = (categoryName: string) => {
    return categoryIcons[categoryName] || Facebook
  }

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
      const charge = parseFloat(calculateCharge())
      
      // Create order
      const { error } = await supabase
        .from('orders')
        .insert({
          client_id: user.client_id,
          service_id: selectedService.service_id,
          order_url: link,
          order_quantity: parseInt(quantity),
          order_charge: charge,
          order_status: 'pending',
          order_create: new Date().toISOString()
        })

      if (error) throw error

      // Update user balance
      const newBalance = (parseFloat(user.balance) || 0) - charge
      await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('client_id', user.client_id)

      // Update local storage
      const updatedUser = { ...user, balance: newBalance.toString() }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)

      alert("Order placed successfully!")
      router.push('/dashboard/orders')
    } catch (error) {
      console.error('Error placing order:', error)
      alert("Failed to place order. Please try again.")
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
          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-rose-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.category_name)
              return (
                <button
                  key={cat.category_id}
                  onClick={() => {
                    setSelectedCategory(cat.category_id)
                    setSelectedService(null)
                  }}
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

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
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
                {service.service_refill === 'no' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 text-slate-500">
                    No Refill
                  </span>
                ) : service.service_refill === 'non-drop' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-green-100 text-green-700">
                     Non-Drop
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
                  Min: {service.service_min} - Max: {service.service_max}
                </span>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Service Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-rose-100 p-6 mb-8"
        >
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-rose-100 p-6 mb-8"
        >
          <h2 className="font-mono text-sm text-slate-500 uppercase tracking-wider mb-4">Service Analytics</h2>
          <div className="text-center py-4">
            {parseFloat(user.balance || '0') > 0 ? (
              <p className="font-mono text-sm text-green-500">You have {formatPrice(parseFloat(user.balance))} balance available</p>
            ) : (
              <p className="font-mono text-sm text-slate-500">You need to have a positive balance to view service analytics</p>
            )}
            <p className="font-mono text-xs text-slate-400 mt-2">Average Time: Not enough data</p>
            <p className="font-mono text-xs text-slate-400">Last updated: Not recorded</p>
          </div>
        </motion.div>

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
                  type="url"
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
              <div>
                <label className="font-mono text-xs text-slate-500 uppercase block mb-2">
                  Quantity <span className="text-slate-400">Min: {selectedService.service_min} - Max: {selectedService.service_max}</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min={selectedService.service_min}
                  max={selectedService.service_max}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-rose-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
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
