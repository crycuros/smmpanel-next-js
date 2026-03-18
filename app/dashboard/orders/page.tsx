"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import BrutalistSidebar from "@/components/brutalist-sidebar"
import { useCurrency } from "@/hooks/useCurrency"
import { 
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  X,
  ArrowUpDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react"

interface Order {
  order_id: number
  service_id: number
  order_url: string
  order_quantity: number
  order_charge: number
  order_status: string
  order_start: number
  order_finish: number
  order_remains: number
  order_create: string
  last_check: string
}

interface Service {
  service_id: number
  service_name: string
}

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  pending: { 
    color: "text-yellow-600", 
    bg: "bg-yellow-100", 
    label: "Pending",
    icon: Clock 
  },
  processing: { 
    color: "text-blue-600", 
    bg: "bg-blue-100", 
    label: "Processing",
    icon: Loader2 
  },
  inprogress: { 
    color: "text-blue-500", 
    bg: "bg-blue-50", 
    label: "In Progress",
    icon: RefreshCw 
  },
  completed: { 
    color: "text-green-600", 
    bg: "bg-green-100", 
    label: "Completed",
    icon: CheckCircle 
  },
  partial: { 
    color: "text-orange-600", 
    bg: "bg-orange-100", 
    label: "Partial",
    icon: AlertCircle 
  },
  canceled: { 
    color: "text-red-600", 
    bg: "bg-red-100", 
    label: "Canceled",
    icon: XCircle 
  },
}

export default function Orders() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const router = useRouter()
  const { currency, config, formatPrice } = useCurrency()

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
    setIsLoading(true)
    try {
      // Fetch orders for this user
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', clientId)
        .order('order_id', { ascending: false })

      if (ordersData) {
        setOrders(ordersData)
        setFilteredOrders(ordersData)
      }

      // Fetch all services for name lookup
      const { data: servicesData } = await supabase
        .from('services')
        .select('service_id, service_name')

      if (servicesData) {
        setServices(servicesData)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let result = [...orders]

    // Filter by search
    if (search) {
      result = result.filter(order => {
        const service = services.find(s => s.service_id === order.service_id)
        const serviceName = service?.service_name || ''
        const orderId = order.order_id.toString()
        return orderId.includes(search) || 
               serviceName.toLowerCase().includes(search.toLowerCase()) ||
               order.order_url.toLowerCase().includes(search.toLowerCase())
      })
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(order => order.order_status === statusFilter)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.order_create).getTime() - new Date(a.order_create).getTime()
      } else if (sortBy === "oldest") {
        return new Date(a.order_create).getTime() - new Date(b.order_create).getTime()
      } else if (sortBy === "highest") {
        return b.order_charge - a.order_charge
      } else {
        return a.order_charge - b.order_charge
      }
    })

    setFilteredOrders(result)
  }, [orders, search, statusFilter, sortBy, services])

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.service_id === serviceId)
    return service?.service_name || `Service #${serviceId}`
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.pending
  }

  const renderStatusBadge = (status: string) => {
    const config = getStatusConfig(status)
    const StatusIcon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-mono text-xs ${config.bg} ${config.color}`}>
        <StatusIcon size={12} />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'pending').length,
    processing: orders.filter(o => o.order_status === 'processing' || o.order_status === 'inprogress').length,
    completed: orders.filter(o => o.order_status === 'completed').length,
    partial: orders.filter(o => o.order_status === 'partial').length,
    canceled: orders.filter(o => o.order_status === 'canceled').length,
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
            Orders <span className="italic text-rose-500 font-semibold">History</span>
          </h1>
          <p className="font-mono text-sm text-slate-500">View and manage your orders</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8"
        >
          {[
            { label: "All Orders", value: stats.total, color: "text-slate-900", bg: "bg-white" },
            { label: "Pending", value: stats.pending, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Processing", value: stats.processing, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Completed", value: stats.completed, color: "text-green-600", bg: "bg-green-50" },
            { label: "Partial", value: stats.partial, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Canceled", value: stats.canceled, color: "text-red-600", bg: "bg-red-50" },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => setStatusFilter(stat.label === "All Orders" ? "all" : stat.label.toLowerCase())}
              className={`${stat.bg} rounded-xl p-4 border ${statusFilter === (stat.label === "All Orders" ? "all" : stat.label.toLowerCase()) ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-rose-100'} transition-all hover:scale-105`}
            >
              <p className={`font-mono text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="font-mono text-[10px] text-slate-500 uppercase">{stat.label}</p>
            </button>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-rose-100 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order ID, service or URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-rose-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-8 py-3 bg-slate-50 border border-rose-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="inprogress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="partial">Partial</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-12 pr-8 py-3 bg-slate-50 border border-rose-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Charge</option>
                <option value="lowest">Lowest Charge</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-rose-100 overflow-hidden"
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 size={40} className="text-rose-500 animate-spin mx-auto mb-4" />
              <p className="font-mono text-sm text-slate-500">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-mono text-lg text-slate-500 mb-2">No orders found</p>
              <p className="font-mono text-sm text-slate-400">Place your first order to see it here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-rose-50 border-b border-rose-100">
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Order ID</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Service</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Link</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Quantity</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Charge</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Status</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Date</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.order_status)
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <tr key={order.order_id} className="border-b border-rose-50 hover:bg-rose-50/30 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-sm font-semibold text-slate-900">#{order.order_id}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm text-slate-700 line-clamp-1">{getServiceName(order.service_id)}</span>
                        </td>
                        <td className="p-4">
                          <a 
                            href={order.order_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-rose-500 hover:text-rose-600 line-clamp-1 max-w-[150px] block"
                          >
                            {order.order_url}
                          </a>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm text-slate-700">{order.order_quantity.toLocaleString()}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm font-semibold text-rose-500">{formatPrice(order.order_charge)}</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-mono text-xs ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon size={12} />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-xs text-slate-500">{formatDate(order.order_create)}</span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 hover:bg-rose-100 rounded-lg transition-colors"
                          >
                            <Eye size={16} className="text-slate-500" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="font-mono text-lg font-semibold text-slate-900">Order #{selectedOrder.order_id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-rose-100">
                  <span className="font-mono text-sm text-slate-500">Service</span>
                  <span className="font-mono text-sm text-slate-900 text-right">{getServiceName(selectedOrder.service_id)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-rose-100">
                  <span className="font-mono text-sm text-slate-500">Link</span>
                  <a 
                    href={selectedOrder.order_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-rose-500 hover:text-rose-600 text-right max-w-[200px] truncate"
                  >
                    {selectedOrder.order_url}
                  </a>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-rose-100">
                  <span className="font-mono text-sm text-slate-500">Quantity</span>
                  <span className="font-mono text-sm text-slate-900">{selectedOrder.order_quantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-rose-100">
                  <span className="font-mono text-sm text-slate-500">Charge</span>
                  <span className="font-mono text-sm font-semibold text-rose-500">{formatPrice(selectedOrder.order_charge)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-rose-100">
                  <span className="font-mono text-sm text-slate-500">Status</span>
                  {renderStatusBadge(selectedOrder.order_status)}
                </div>
                <div className="flex justify-between items-center py-3 border-b border-rose-100">
                  <span className="font-mono text-sm text-slate-500">Start Count</span>
                  <span className="font-mono text-sm text-slate-900">{selectedOrder.order_start.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-rose-100">
                  <span className="font-mono text-sm text-slate-500">Remains</span>
                  <span className="font-mono text-sm text-slate-900">{selectedOrder.order_remains.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-mono text-sm text-slate-500">Date</span>
                  <span className="font-mono text-xs text-slate-500">{formatDate(selectedOrder.order_create)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
