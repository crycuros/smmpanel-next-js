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
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  X,
  Check
} from "lucide-react"

export default function AdminUsers() {
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    balance: "0",
    password: ""
  })
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
    fetchUsers()
  }, [router])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('client_id', { ascending: false })

      if (data) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    router.push('/admin')
  }

  const handleAddUser = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            username: formData.username,
            phone: formData.phone,
            balance: parseFloat(formData.balance) || 0,
            register_date: new Date().toISOString(),
            password: formData.password
          }
        ])
        .select()

      if (error) throw error

      setShowAddModal(false)
      setFormData({ name: "", email: "", username: "", phone: "", balance: "0", password: "" })
      fetchUsers()
    } catch (error) {
      console.error('Error adding user:', error)
      alert('Failed to add user')
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          phone: formData.phone,
          balance: parseFloat(formData.balance) || 0
        })
        .eq('client_id', selectedUser.client_id)

      if (error) throw error

      setShowEditModal(false)
      setSelectedUser(null)
      setFormData({ name: "", email: "", username: "", phone: "", balance: "0", password: "" })
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  const handleDeleteUser = async (clientId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('client_id', clientId)

      if (error) throw error

      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const openEditModal = (user: any) => {
    setSelectedUser(user)
    setFormData({
      name: user.name || "",
      email: user.email || "",
      username: user.username || "",
      phone: user.phone || "",
      balance: user.balance?.toString() || "0",
      password: ""
    })
    setShowEditModal(true)
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

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.client_id?.toString().includes(searchQuery)
  )

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
          <Users size={20} className="text-white" />
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-sans text-3xl font-bold text-white mb-2">Users</h1>
            <p className="font-mono text-sm text-slate-400">Manage registered users</p>
          </div>
          <button
            onClick={() => {
              setFormData({ name: "", email: "", username: "", phone: "", balance: "0", password: "" })
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-mono text-sm transition-colors"
          >
            <UserPlus size={18} />
            Add User
          </button>
        </div>

        {/* Search */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, username, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Users Table */}
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
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Name</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Username</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Email</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Phone</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Balance</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Joined</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-8">
                        <p className="font-mono text-sm text-slate-400">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <motion.tr
                        key={u.client_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="p-4 font-mono text-sm text-white">#{u.client_id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center">
                              <span className="font-mono text-sm text-rose-500 font-bold">
                                {(u.name || u.username || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-mono text-sm text-white">{u.name || '-'}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm text-slate-300">{u.username || '-'}</td>
                        <td className="p-4 font-mono text-sm text-slate-300">{u.email || '-'}</td>
                        <td className="p-4 font-mono text-sm text-slate-300">{u.phone || '-'}</td>
                        <td className="p-4 font-mono text-sm text-green-500">{config.symbol} {parseFloat(u.balance || '0').toFixed(2)}</td>
                        <td className="p-4 font-mono text-xs text-slate-400">
                          {u.register_date ? new Date(u.register_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                            >
                              <Edit size={14} className="text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.client_id)}
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
            Total Users: <span className="text-white font-semibold">{users.length}</span>
          </p>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700"
          >
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-mono text-lg font-semibold text-white">Add New User</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="+63..."
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Initial Balance ({config.symbol})</label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({...formData, balance: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={handleAddUser}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-mono text-sm transition-colors"
              >
                <Check size={18} />
                Add User
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700"
          >
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-mono text-lg font-semibold text-white">Edit User #{selectedUser?.client_id}</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedUser(null)
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Balance ({config.symbol})</label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({...formData, balance: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
              <button
                onClick={handleEditUser}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-mono text-sm transition-colors"
              >
                <Check size={18} />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
