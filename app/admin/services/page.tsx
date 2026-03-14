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
  Loader2,
  X,
  Check,
  AlertCircle
} from "lucide-react"

export default function AdminServices() {
  const [user, setUser] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [formData, setFormData] = useState({
    service_name: "",
    category_id: "",
    service_price: "",
    service_min: "",
    service_max: "",
    service_desc: "",
    service_refill: "no" // Added refill field
  })
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<{show: boolean, category: any, serviceCount: number}>({show: false, category: null, serviceCount: 0})
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
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*, service_profit')
        .order('service_id', { ascending: false })

      if (servicesError) {
        console.error('Services fetch error:', servicesError)
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('category_id, category_name')
        .order('category_id', { ascending: true })

      if (categoriesError) {
        console.error('Categories fetch error:', categoriesError)
      }

      if (servicesData && categoriesData) {
        // Map category names to services
        const categoryMap = new Map(categoriesData.map((c: any) => [c.category_id, c.category_name]))
        const servicesWithCategory = servicesData.map(service => {
          // Calculate provider price from customer price and profit percentage
          // Use default 20% profit if service_profit is not set
          const customerPrice = parseFloat(service.service_price) || 0
          const profitPercent = parseFloat(service.service_profit) || 20
          const providerPrice = profitPercent > 0 ? customerPrice / (1 + profitPercent / 100) : customerPrice
          
          return {
            ...service,
            category_name: categoryMap.get(service.category_id) || 'Uncategorized',
            provider_price: providerPrice.toFixed(2),
            customer_price: customerPrice.toFixed(2)
          }
        })
        setServices(servicesWithCategory)
        setCategories(categoriesData)
      } else if (servicesData) {
        // Also calculate provider price for services without categories
        // Use default 20% profit if service_profit is not set
        const servicesWithPrice = servicesData.map(service => {
          const customerPrice = parseFloat(service.service_price) || 0
          const profitPercent = parseFloat(service.service_profit) || 20
          const providerPrice = profitPercent > 0 ? customerPrice / (1 + profitPercent / 100) : customerPrice
          return {
            ...service,
            provider_price: providerPrice.toFixed(2),
            customer_price: customerPrice.toFixed(2)
          }
        })
        setServices(servicesWithPrice)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    router.push('/admin')
  }

  const handleAddService = async () => {
    try {
      const { error } = await supabase
        .from('services')
        .insert([
          {
            service_name: formData.service_name,
            category_id: parseInt(formData.category_id) || 1,
            service_price: parseFloat(formData.service_price) || 0,
            service_min: parseInt(formData.service_min) || 1,
            service_max: parseInt(formData.service_max) || 1000,
            service_description: formData.service_desc,
            service_refill: formData.service_refill || 'no'
          }
        ])

      if (error) throw error

      setShowAddModal(false)
      setFormData({ service_name: "", category_id: "", service_price: "", service_min: "", service_max: "", service_desc: "", service_refill: "no" })
      fetchData()
    } catch (error) {
      console.error('Error adding service:', error)
      alert('Failed to add service')
    }
  }

  const handleEditService = async () => {
    if (!selectedService) return
    
    try {
      const { error } = await supabase
        .from('services')
        .update({
          service_name: formData.service_name,
          category_id: parseInt(formData.category_id) || 1,
          service_price: parseFloat(formData.service_price) || 0,
          service_min: parseInt(formData.service_min) || 1,
          service_max: parseInt(formData.service_max) || 1000,
          service_description: formData.service_desc,
          service_refill: formData.service_refill || 'no'
        })
        .eq('service_id', selectedService.service_id)

      if (error) throw error

      setShowEditModal(false)
      setSelectedService(null)
      setFormData({ service_name: "", category_id: "", service_price: "", service_min: "", service_max: "", service_desc: "", service_refill: "no" })
      fetchData()
    } catch (error) {
      console.error('Error updating service:', error)
      alert('Failed to update service')
    }
  }

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('service_id', serviceId)

      if (error) throw error

      fetchData()
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Failed to delete service')
    }
  }

  // Delete category with service check
  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    try {
      // First check if category has any services
      const { data: servicesInCategory, error: countError } = await supabase
        .from('services')
        .select('service_id', { count: 'exact' })
        .eq('category_id', categoryId)

      if (countError) throw countError

      const serviceCount = servicesInCategory?.length || 0

      if (serviceCount > 0) {
        // Category has services - show confirmation dialog
        setDeleteCategoryModal({ show: true, category: { id: categoryId, name: categoryName }, serviceCount })
      } else {
        // Category is empty - delete without confirmation
        const { error: deleteError } = await supabase
          .from('categories')
          .delete()
          .eq('category_id', categoryId)

        if (deleteError) throw deleteError

        alert(`Category "${categoryName}" deleted successfully`)
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  // Confirm delete category (called from modal)
  const confirmDeleteCategory = async () => {
    if (!deleteCategoryModal.category) return

    try {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('category_id', deleteCategoryModal.category.id)

      if (deleteError) throw deleteError

      // Also update services in this category to uncategorized (category_id = 1)
      await supabase
        .from('services')
        .update({ category_id: 1 })
        .eq('category_id', deleteCategoryModal.category.id)

      alert(`Category "${deleteCategoryModal.category.name}" deleted. ${deleteCategoryModal.serviceCount} services moved to Uncategorized.`)
      setDeleteCategoryModal({ show: false, category: null, serviceCount: 0 })
      fetchData()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  const openEditModal = (service: any) => {
    setSelectedService(service)
    setFormData({
      service_name: service.service_name || "",
      category_id: service.category_id?.toString() || "",
      service_price: service.service_price?.toString() || "",
      service_min: service.service_min?.toString() || "",
      service_max: service.service_max?.toString() || "",
      service_desc: service.service_description || "",
      service_refill: service.service_refill || "no"
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

  const filteredServices = services.filter(s => {
    const matchesSearch = 
      s.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.service_id?.toString().includes(searchQuery)
    const matchesCategory = selectedCategory === "all" || s.category_id?.toString() === selectedCategory
    return matchesSearch && matchesCategory
  })

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
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-slate-700 rounded-lg">
          <Wrench size={20} className="text-white" />
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

      {/* Main Content */}
      <main className="lg:ml-64 p-6 pt-20 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-sans text-3xl font-bold text-white mb-2">Services</h1>
            <p className="font-mono text-sm text-slate-400">Manage services offered</p>
          </div>
          <button onClick={() => { setFormData({ service_name: "", category_id: "", service_price: "", service_min: "", service_max: "", service_desc: "", service_refill: "no" }); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-mono text-sm transition-colors">
            <Plus size={18} /> Add Service
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search services by name or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-rose-500" />
            </div>
            <div className="flex items-center gap-2">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500 min-w-[200px]">
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id.toString()}>{cat.category_name}</option>
                ))}
              </select>
              {selectedCategory !== "all" && (
                <button onClick={() => {
                  const cat = categories.find(c => c.category_id.toString() === selectedCategory)
                  if (cat) handleDeleteCategory(cat.category_id, cat.category_name)
                }} className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-400 transition-colors" title="Delete Category">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Services Table */}
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
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Service</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Category</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Price</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Min/Max</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8">
                        <p className="font-mono text-sm text-slate-400">No services found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((service) => (
                      <motion.tr key={service.service_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 font-mono text-sm text-white">#{service.service_id}</td>
                        <td className="p-4 font-mono text-sm text-white max-w-[200px] truncate">{service.service_name}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-full font-mono text-xs">
                            {service.category_name}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-sm text-rose-500 font-semibold">{config.symbol} {service.customer_price || Number(service.service_price || 0).toFixed(2)}</span>
                            <span className="font-mono text-xs text-slate-500">Cost: {config.symbol} {service.provider_price || '0.00'}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm text-slate-300">{service.service_min} / {service.service_max}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(service)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                              <Edit size={14} className="text-blue-400" />
                            </button>
                            <button onClick={() => handleDeleteService(service.service_id)} className="p-2 bg-slate-700 hover:bg-red-500/20 rounded-lg transition-colors">
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

        <div className="mt-6 text-center">
          <p className="font-mono text-sm text-slate-400">Total Services: <span className="text-white font-semibold">{services.length}</span></p>
        </div>
      </main>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800">
              <h2 className="font-mono text-lg font-semibold text-white">Add New Service</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Service Name</label>
                <input type="text" value={formData.service_name} onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="e.g., Facebook Likes" />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Category</label>
                <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500">
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Price per 1000</label>
                <input type="number" value={formData.service_price} onChange={(e) => setFormData({...formData, service_price: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="0.00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-2">Min</label>
                  <input type="number" value={formData.service_min} onChange={(e) => setFormData({...formData, service_min: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                    placeholder="1" />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-2">Max</label>
                  <input type="number" value={formData.service_max} onChange={(e) => setFormData({...formData, service_max: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                    placeholder="1000" />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Description</label>
                <textarea value={formData.service_desc} onChange={(e) => setFormData({...formData, service_desc: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500 h-24 resize-none"
                  placeholder="Service description..." />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Refill Guarantee</label>
                <select value={formData.service_refill} onChange={(e) => setFormData({...formData, service_refill: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500">
                  <option value="no">No Refill</option>
                  <option value="refill">Refill (30 days)</option>
                  <option value="non-drop">Non-Drop</option>
                </select>
              </div>
              <button onClick={handleAddService}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-mono text-sm transition-colors">
                <Check size={18} /> Add Service
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800">
              <h2 className="font-mono text-lg font-semibold text-white">Edit Service #{selectedService?.service_id}</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedService(null); }} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Service Name</label>
                <input type="text" value={formData.service_name} onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Category</label>
                <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500">
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Price per 1000</label>
                <input type="number" value={formData.service_price} onChange={(e) => setFormData({...formData, service_price: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-2">Min</label>
                  <input type="number" value={formData.service_min} onChange={(e) => setFormData({...formData, service_min: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-2">Max</label>
                  <input type="number" value={formData.service_max} onChange={(e) => setFormData({...formData, service_max: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500" />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Description</label>
                <textarea value={formData.service_desc} onChange={(e) => setFormData({...formData, service_desc: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500 h-24 resize-none" />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Refill Guarantee</label>
                <select value={formData.service_refill} onChange={(e) => setFormData({...formData, service_refill: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500">
                  <option value="no">No Refill</option>
                  <option value="refill">Refill (30 days)</option>
                  <option value="non-drop">Non-Drop</option>
                </select>
              </div>
              <button onClick={handleEditService}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-mono text-sm transition-colors">
                <Check size={18} /> Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deleteCategoryModal.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <h3 className="font-mono text-lg text-white font-semibold">Delete Category?</h3>
            </div>
            <p className="font-mono text-sm text-slate-300 mb-4">
              Are you sure you want to delete <span className="text-white font-semibold">"{deleteCategoryModal.category?.name}"</span>?
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="font-mono text-sm text-yellow-400">
                ⚠️ This category contains <span className="font-bold">{deleteCategoryModal.serviceCount} service(s)</span> that will be moved to Uncategorized.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteCategoryModal({ show: false, category: null, serviceCount: 0 })}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-mono text-sm transition-colors">
                Cancel
              </button>
              <button onClick={confirmDeleteCategory}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-mono text-sm transition-colors">
                Delete Anyway
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
