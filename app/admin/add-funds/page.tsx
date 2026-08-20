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
  Loader2,
  Plus,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Tag
} from "lucide-react"

export default function AdminAddFunds() {
  const [user, setUser] = useState<any>(null)
  const [fundRequests, setFundRequests] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [showModal, setShowModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
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
      // Fetch fund requests (user_id references clients table)
      const { data: requestsData } = await supabase
        .from('funds')
        .select('*, clients(username, email, balance)')
        .order('id', { ascending: false })
        .limit(10000)

      if (requestsData) {
        setFundRequests(requestsData)
      }

      // Fetch users for manual add
      const { data: usersData } = await supabase
        .from('clients')
        .select('client_id, username, email, balance')
        .order('client_id', { ascending: false })
        .limit(10000)

      if (usersData) {
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    router.push('/admin')
  }

  const handleApprove = async (requestId: number, userId: number, amount: number) => {
    try {
      // Update fund request status
      const { error: updateError } = await supabase
        .from('funds')
        .update({ status: 'approved' })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Update user balance
      const { error: balanceError } = await supabase
        .from('clients')
        .update({ balance: (await getUserBalance(userId)) + amount })
        .eq('client_id', userId)

      if (balanceError) throw balanceError

      fetchData()
    } catch (error) {
      console.error('Error approving fund request:', error)
      alert('Failed to approve request')
    }
  }

  const handleReject = async (requestId: number) => {
    try {
      const { error } = await supabase
        .from('funds')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (error) throw error

      fetchData()
    } catch (error) {
      console.error('Error rejecting fund request:', error)
      alert('Failed to reject request')
    }
  }

  const getUserBalance = async (userId: number) => {
    const { data } = await supabase
      .from('clients')
      .select('balance')
      .eq('client_id', userId)
      .single()
    return data?.balance || 0
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

  const filteredRequests = fundRequests.filter(r => {
    const matchesSearch = 
      r.id?.toString().includes(searchQuery) ||
      r.users?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.users?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: fundRequests.length,
    pending: fundRequests.filter(r => r.status === 'pending').length,
    approved: fundRequests.filter(r => r.status === 'approved').length,
    rejected: fundRequests.filter(r => r.status === 'rejected').length,
    totalAmount: fundRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.amount || 0), 0)
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <h1 className="font-mono text-lg font-bold text-white">MND Admin</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-slate-700 rounded-lg">
          <DollarSign size={20} className="text-white" />
        </button>
      </div>

      <aside className={`fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-40 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-slate-700">
          <h1 className="font-mono text-xl font-bold text-white">MND</h1>
          <p className="font-mono text-xs text-slate-400">Admin Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <Icon size={18} />
                <span className="font-mono text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors w-full">
            <LogOut size={18} />
            <span className="font-mono text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="lg:ml-64 p-6 pt-20 lg:pt-6">
        <div className="mb-8">
          <h1 className="font-sans text-3xl font-bold text-white mb-2">Add Funds</h1>
          <p className="font-mono text-sm text-slate-400">Manage fund requests and manual additions</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-slate-400 uppercase">Total</p>
            <p className="font-mono text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-yellow-500 uppercase">Pending</p>
            <p className="font-mono text-2xl font-bold text-yellow-500">{stats.pending}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-green-500 uppercase">Approved</p>
            <p className="font-mono text-2xl font-bold text-green-500">{stats.approved}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-red-500 uppercase">Rejected</p>
            <p className="font-mono text-2xl font-bold text-red-500">{stats.rejected}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-rose-500 uppercase">Total Received</p>
            <p className="font-mono text-2xl font-bold text-rose-500">{config.symbol}{stats.totalAmount.toFixed(0)}</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search requests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-rose-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStatusFilter("pending")} className={`px-4 py-2 rounded-xl font-mono text-sm transition-colors ${statusFilter === "pending" ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>Pending</button>
              <button onClick={() => setStatusFilter("approved")} className={`px-4 py-2 rounded-xl font-mono text-sm transition-colors ${statusFilter === "approved" ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>Approved</button>
              <button onClick={() => setStatusFilter("rejected")} className={`px-4 py-2 rounded-xl font-mono text-sm transition-colors ${statusFilter === "rejected" ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>Rejected</button>
              <button onClick={() => setStatusFilter("all")} className={`px-4 py-2 rounded-xl font-mono text-sm transition-colors ${statusFilter === "all" ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>All</button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={32} className="text-rose-500 animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center p-8">
              <p className="font-mono text-sm text-slate-400">No fund requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50 border-b border-slate-700">
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">ID</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">User</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Amount</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Method</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Transaction</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Status</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Date</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-4 font-mono text-sm text-white">#{request.id}</td>
                      <td className="p-4">
                        <p className="font-mono text-sm text-white">{request.users?.username || '-'}</p>
                        <p className="font-mono text-xs text-slate-400">{request.users?.email || '-'}</p>
                      </td>
                      <td className="p-4 font-mono text-sm text-rose-500">{config.symbol} {request.amount?.toFixed(2)}</td>
                      <td className="p-4 font-mono text-sm text-slate-300">{request.method || 'Manual'}</td>
                      <td className="p-4 font-mono text-xs text-slate-400 max-w-[150px] truncate">{request.transaction_id || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full font-mono text-xs ${
                          request.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                          request.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-400">
                        {request.created_at ? new Date(request.created_at).toLocaleString() : '-'}
                      </td>
                      <td className="p-4">
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApprove(request.id, request.user_id, request.amount)} className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors">
                              <CheckCircle size={14} className="text-green-500" />
                            </button>
                            <button onClick={() => handleReject(request.id)} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">
                              <XCircle size={14} className="text-red-500" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
