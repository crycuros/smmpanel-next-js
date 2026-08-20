"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useCurrency } from "@/hooks/useCurrency"
import { 
  Users,
  ShoppingCart,
  Wrench,
  MessageSquare,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Filter,
  Loader2,
  Eye,
  Edit,
  Trash2,
  X,
  Check,
  Tag,
  Clock,
  AlertCircle
} from "lucide-react"

export default function AdminOrders() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [newStatus, setNewStatus] = useState("")
  const router = useRouter()
  const { currency, config } = useCurrency()

  useEffect(() => {
    const adminData = localStorage.getItem('admin')
    if (!adminData) {
      router.push('/admin')
      return
    }
    
    const admin = JSON.parse(adminData)
    if (!admin.loggedIn) {
      router.push('/admin')
      return
    }
    
    setUser(admin)
    fetchData()
  }, [router])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch orders with user info
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, users(username, email)')
        .order('order_id', { ascending: false })
        .limit(10000)

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('service_id, service_name')

      if (ordersData) {
        // Add service names to orders
        const ordersWithServices = ordersData.map(order => {
          const service = servicesData?.find(s => s.service_id === order.service_id)
          return {
            ...order,
            service_name: service?.service_name || `Service #${order.service_id}`
          }
        })
        setOrders(ordersWithServices)
      }

      if (servicesData) {
        setServices(servicesData)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    router.push('/admin')
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('order_id', selectedOrder.order_id)

      if (error) throw error

      setShowEditModal(false)
      setSelectedOrder(null)
      setNewStatus("")
      fetchData()
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order')
    }
  }

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return
    
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('order_id', orderId)

      if (error) throw error

      fetchData()
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Failed to delete order')
    }
  }

  const openEditModal = (order: any) => {
    setSelectedOrder(order)
    setNewStatus(order.order_status)
    setShowEditModal(true)
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Services", href: "/admin/services", icon: Wrench },
    { name: "Categories", href: "/admin/categories", icon: Tag },
    { name: "Tickets", href: "/admin/tickets", icon: MessageSquare },
    { name: "Add Funds", href: "/admin/add-funds", icon: DollarSign },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-500/20 text-yellow-500" },
    { value: "processing", label: "Processing", color: "bg-blue-500/20 text-blue-500" },
    { value: "inprogress", label: "In Progress", color: "bg-purple-500/20 text-purple-500" },
    { value: "completed", label: "Completed", color: "bg-green-500/20 text-green-500" },
    { value: "canceled", label: "Canceled", color: "bg-red-500/20 text-red-500" },
  ]

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.order_id?.toString().includes(searchQuery) ||
      o.users?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.users?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.service_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || o.order_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'pending').length,
    processing: orders.filter(o => ['processing', 'inprogress'].includes(o.order_status)).length,
    completed: orders.filter(o => o.order_status === 'completed').length,
    canceled: orders.filter(o => o.order_status === 'canceled').length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.order_charge || 0), 0)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 size={40} className="text-rose-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <h1 className="font-mono text-lg font-bold text-white">MND Admin</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-slate-700 rounded-lg"
        >
          <ShoppingCart size={20} className="text-white" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-40 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-slate-700">
          <h1 className="font-mono text-xl font-bold text-white">MND</h1>
          <p className="font-mono text-xs text-slate-400">Admin Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Icon size={18} />
                <span className="font-mono text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut size={18} />
            <span className="font-mono text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 p-6 pt-20 lg:pt-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-sans text-3xl font-bold text-white mb-2">Orders</h1>
          <p className="font-mono text-sm text-slate-400">Manage all orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-slate-400 uppercase">Total</p>
            <p className="font-mono text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-yellow-500 uppercase">Pending</p>
            <p className="font-mono text-2xl font-bold text-yellow-500">{stats.pending}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-blue-500 uppercase">Processing</p>
            <p className="font-mono text-2xl font-bold text-blue-500">{stats.processing}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-green-500 uppercase">Completed</p>
            <p className="font-mono text-2xl font-bold text-green-500">{stats.completed}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-red-500 uppercase">Canceled</p>
            <p className="font-mono text-2xl font-bold text-red-500">{stats.canceled}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-rose-500 uppercase">Revenue</p>
            <p className="font-mono text-2xl font-bold text-rose-500">{config.symbol}{stats.totalRevenue.toFixed(0)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order ID, user, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-xl font-mono text-sm transition-colors ${
                  statusFilter === "all" 
                    ? "bg-rose-500 text-white" 
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                All
              </button>
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-4 py-2 rounded-xl font-mono text-sm transition-colors ${
                    statusFilter === status.value 
                      ? "bg-rose-500 text-white" 
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={32} className="text-rose-500 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50 border-b border-slate-700">
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">ID</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">User</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Service</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Link</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Amount</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Status</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Date</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-8">
                        <p className="font-mono text-sm text-slate-400">No orders found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <motion.tr
                        key={order.order_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="p-4 font-mono text-sm text-white">#{order.order_id}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-mono text-sm text-white">{order.users?.username || '-'}</p>
                            <p className="font-mono text-xs text-slate-400">{order.users?.email || '-'}</p>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm text-slate-300 max-w-[150px] truncate">
                          {order.service_name}
                        </td>
                        <td className="p-4 font-mono text-sm text-blue-400 max-w-[150px] truncate">
                          <a 
                            href={order.order_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {order.order_link || '-'}
                          </a>
                        </td>
                        <td className="p-4 font-mono text-sm text-rose-500">{config.symbol} {order.order_charge?.toFixed(2) || '0.00'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full font-mono text-xs ${
                            order.order_status === 'completed' ? 'bg-green-500/20 text-green-500' :
                            order.order_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            order.order_status === 'canceled' ? 'bg-red-500/20 text-red-500' :
                            order.order_status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-purple-500/20 text-purple-500'
                          }`}>
                            {order.order_status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs text-slate-400">
                          {order.created_at ? new Date(order.created_at).toLocaleString() : '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(order)}
                              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                            >
                              <Edit size={14} className="text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.order_id)}
                              className="p-2 bg-slate-700 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 text-center">
          <p className="font-mono text-sm text-slate-400">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
        </div>
      </main>

      {/* Edit Order Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700"
          >
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-mono text-lg font-semibold text-white">Edit Order #{selectedOrder?.order_id}</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedOrder(null)
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Service</label>
                <p className="font-mono text-sm text-white">{selectedOrder?.service_name}</p>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Link</label>
                <p className="font-mono text-sm text-blue-400 truncate">{selectedOrder?.order_link}</p>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Amount</label>
                <p className="font-mono text-sm text-rose-500">{config.symbol} {selectedOrder?.order_charge?.toFixed(2)}</p>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleUpdateStatus}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-mono text-sm transition-colors"
              >
                <Check size={18} />
                Update Status
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
