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
  TrendingUp,
  TrendingDown,
  Menu,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  Zap,
  Globe,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    revenue: 0,
    tickets: 0,
    avgOrderValue: 0,
    conversionRate: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    canceled: 0
  })
  const [topServices, setTopServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('order_charge, order_status, service_id')

      const ordersCount = ordersData?.length || 0
      const totalRevenue = ordersData?.reduce((sum, o) => sum + (o.order_charge || 0), 0) || 0
      
      // Order status breakdown
      const pending = ordersData?.filter(o => o.order_status === 'pending').length || 0
      const processing = ordersData?.filter(o => ['processing', 'inprogress'].includes(o.order_status)).length || 0
      const completed = ordersData?.filter(o => o.order_status === 'completed').length || 0
      const canceled = ordersData?.filter(o => o.order_status === 'canceled').length || 0

      // Top services
      const serviceCounts: Record<number, number> = {}
      ordersData?.forEach(order => {
        if (order.service_id) {
          serviceCounts[order.service_id] = (serviceCounts[order.service_id] || 0) + 1
        }
      })
      const sortedServices: any[] = Object.entries(serviceCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([id, count]) => ({ service_id: parseInt(id), count }))

      // Fetch service names
      if (sortedServices.length > 0) {
        const { data: servicesData } = await supabase
          .from('services')
          .select('service_id, service_name')
          .in('service_id', sortedServices.map(s => s.service_id))
        
        if (servicesData) {
          sortedServices.forEach(s => {
            const service = servicesData.find(serv => serv.service_id === s.service_id)
            if (service) s.service_name = service.service_name
          })
        }
      }

      // Fetch tickets count
      const { count: ticketsCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })

      setStats({
        users: usersCount || 0,
        orders: ordersCount,
        revenue: totalRevenue,
        tickets: ticketsCount || 0,
        avgOrderValue: ordersCount > 0 ? totalRevenue / ordersCount : 0,
        conversionRate: usersCount && ordersCount > 0 ? (ordersCount / usersCount) * 100 : 0
      })

      setOrderStats({ pending, processing, completed, canceled })
      setTopServices(sortedServices)

      // Fetch recent orders
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('*, users(username)')
        .order('order_id', { ascending: false })
        .limit(10)

      if (recentOrdersData) {
        setRecentOrders(recentOrdersData)
      }

      // Fetch recent users
      const { data: recentUsersData } = await supabase
        .from('users')
        .select('*')
        .order('client_id', { ascending: false })
        .limit(10)

      if (recentUsersData) {
        setRecentUsers(recentUsersData)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    router.push('/admin')
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Services", href: "/admin/services", icon: Wrench },
    { name: "Tickets", href: "/admin/tickets", icon: MessageSquare },
    { name: "Add Funds", href: "/admin/add-funds", icon: DollarSign },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
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
          <Menu size={20} className="text-white" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-40 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-slate-700">
          <h1 className="font-mono text-xl font-bold text-white">MND</h1>
          <p className="font-mono text-xs text-slate-400">MND Admin</p>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-sans text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="font-mono text-sm text-slate-400">Welcome back, Admin</p>
          </div>
          <div className="hidden lg:block text-right">
            <p className="font-mono text-xs text-slate-400">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-blue-500" />
              </div>
              <span className="flex items-center gap-1 text-green-500 font-mono text-xs">
                <TrendingUp size={14} />
                +12%
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400 uppercase">Total Users</p>
            <p className="font-sans text-3xl font-bold text-white">{stats.users}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                <ShoppingCart size={24} className="text-rose-500" />
              </div>
              <span className="flex items-center gap-1 text-green-500 font-mono text-xs">
                <TrendingUp size={14} />
                +8%
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400 uppercase">Total Orders</p>
            <p className="font-sans text-3xl font-bold text-white">{stats.orders}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-green-500" />
              </div>
              <span className="flex items-center gap-1 text-green-500 font-mono text-xs">
                <TrendingUp size={14} />
                +23%
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400 uppercase">Total Revenue</p>
            <p className="font-sans text-3xl font-bold text-white">{config.symbol} {stats.revenue.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <MessageSquare size={24} className="text-yellow-500" />
              </div>
              <span className="flex items-center gap-1 text-red-500 font-mono text-xs">
                <TrendingDown size={14} />
                -5%
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400 uppercase">Open Tickets</p>
            <p className="font-sans text-3xl font-bold text-white">{stats.tickets}</p>
          </motion.div>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
          >
            <h2 className="font-mono text-sm text-white font-semibold mb-4">Order Status</h2>
            <div className="space-y-4">
              {[
                { label: "Pending", value: orderStats.pending, color: "bg-yellow-500", text: "text-yellow-500" },
                { label: "Processing", value: orderStats.processing, color: "bg-blue-500", text: "text-blue-500" },
                { label: "Completed", value: orderStats.completed, color: "bg-green-500", text: "text-green-500" },
                { label: "Canceled", value: orderStats.canceled, color: "bg-red-500", text: "text-red-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-slate-400">{item.label}</span>
                    <span className={`font-mono text-sm font-semibold ${item.text}`}>{item.value}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.orders > 0 ? (item.value / stats.orders) * 100 : 0}%` }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
          >
            <h2 className="font-mono text-sm text-white font-semibold mb-4">Key Metrics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Target size={18} className="text-rose-500" />
                  <span className="font-mono text-sm text-slate-300">Avg Order Value</span>
                </div>
                <span className="font-mono text-sm font-bold text-white">{config.symbol} {stats.avgOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Activity size={18} className="text-blue-500" />
                  <span className="font-mono text-sm text-slate-300">Conversion Rate</span>
                </div>
                <span className="font-mono text-sm font-bold text-white">{stats.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Zap size={18} className="text-yellow-500" />
                  <span className="font-mono text-sm text-slate-300">Completion Rate</span>
                </div>
                <span className="font-mono text-sm font-bold text-white">
                  {stats.orders > 0 ? ((orderStats.completed / stats.orders) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-green-500" />
                  <span className="font-mono text-sm text-slate-300">Active Orders</span>
                </div>
                <span className="font-mono text-sm font-bold text-white">
                  {orderStats.pending + orderStats.processing}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Top Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
          >
            <h2 className="font-mono text-sm text-white font-semibold mb-4">Top Services</h2>
            <div className="space-y-3">
              {topServices.length === 0 ? (
                <p className="font-mono text-xs text-slate-400 text-center py-4">No data yet</p>
              ) : (
                topServices.map((service, index) => (
                  <div key={service.service_id} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-rose-500/20 rounded-full flex items-center justify-center">
                      <span className="font-mono text-[10px] text-rose-500 font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-white truncate">
                        {service.service_name || `Service #${service.service_id}`}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-slate-400">{service.count} orders</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Orders & Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-mono text-sm text-white font-semibold">Recent Orders</h2>
              <Link href="/admin/orders" className="font-mono text-xs text-rose-500 hover:text-rose-400">
                View all →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="text-left p-3 font-mono text-xs text-slate-400">ID</th>
                    <th className="text-left p-3 font-mono text-xs text-slate-400">User</th>
                    <th className="text-left p-3 font-mono text-xs text-slate-400">Amount</th>
                    <th className="text-left p-3 font-mono text-xs text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 5).map((order) => (
                    <tr key={order.order_id} className="border-t border-slate-700/50">
                      <td className="p-3 font-mono text-sm text-white">#{order.order_id}</td>
                      <td className="p-3 font-mono text-sm text-slate-300">
                        {order.users?.username || 'Unknown'}
                      </td>
                      <td className="p-3 font-mono text-sm text-rose-500">
                        {config.symbol} {order.order_charge?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full font-mono text-[10px] ${
                          order.order_status === 'completed' ? 'bg-green-500/20 text-green-500' :
                          order.order_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          order.order_status === 'canceled' ? 'bg-red-500/20 text-red-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {order.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-mono text-sm text-white font-semibold">Recent Users</h2>
              <Link href="/admin/users" className="font-mono text-xs text-rose-500 hover:text-rose-400">
                View all →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="text-left p-3 font-mono text-xs text-slate-400">ID</th>
                    <th className="text-left p-3 font-mono text-xs text-slate-400">Name</th>
                    <th className="text-left p-3 font-mono text-xs text-slate-400">Balance</th>
                    <th className="text-left p-3 font-mono text-xs text-slate-400">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.slice(0, 5).map((user) => (
                    <tr key={user.client_id} className="border-t border-slate-700/50">
                      <td className="p-3 font-mono text-sm text-white">#{user.client_id}</td>
                      <td className="p-3 font-mono text-sm text-slate-300">
                        {user.name || user.username || 'Unknown'}
                      </td>
                      <td className="p-3 font-mono text-sm text-green-500">
                        {config.symbol} {parseFloat(user.balance || '0').toFixed(2)}
                      </td>
                      <td className="p-3 font-mono text-xs text-slate-400">
                        {new Date(user.register_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
