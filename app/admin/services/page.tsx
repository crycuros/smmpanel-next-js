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
  AlertCircle,
  Tag,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw
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
    service_refill: "no",
    api_serviceid: "", // Provider service ID for mapping
    service_profit: "20" // Profit margin percentage (default 20%)
  })
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<{show: boolean, category: any, serviceCount: number}>({show: false, category: null, serviceCount: 0})
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set())
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [bulkProfit, setBulkProfit] = useState("20")
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [bulkEditCategory, setBulkEditCategory] = useState<string>("")
  const [bulkProfitMode, setBulkProfitMode] = useState<"set" | "recalculate">("set") // "set" = replace value, "recalculate" = adjust price to keep provider cost same
  const [currentProfits, setCurrentProfits] = useState<number[]>([])
  const [editProfitMode, setEditProfitMode] = useState<"set" | "recalculate">("set") // Same for individual edit
  const [expandedService, setExpandedService] = useState<number | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
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
      // Fetch services with pagination to get all 1754+ services
      const pageSize = 1000
      let allServices: any[] = []
      let svcFrom = 0
      let hasMore = true
      
      while (hasMore) {
        const { data: servicesPage, error: servicesError } = await supabase
          .from('services')
          .select('*, service_profit')
          .order('service_id', { ascending: false })
          .range(svcFrom, svcFrom + pageSize - 1)
        
        if (servicesError) {
          console.error('Services fetch error:', servicesError)
        }
        
        if (servicesPage && servicesPage.length > 0) {
          allServices = [...allServices, ...servicesPage]
          svcFrom += pageSize
          hasMore = servicesPage.length === pageSize
        } else {
          hasMore = false
        }
      }
      
      const servicesData = allServices

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
            service_refill: formData.service_refill || 'no',
            api_serviceid: parseInt(formData.api_serviceid) || null,
            service_profit: parseFloat(formData.service_profit) || 20
          }
        ])

      if (error) throw error

      setShowAddModal(false)
      setFormData({ service_name: "", category_id: "", service_price: "", service_min: "", service_max: "", service_desc: "", service_refill: "no", api_serviceid: "", service_profit: "20" })
      fetchData()
    } catch (error) {
      console.error('Error adding service:', error)
      alert('Failed to add service')
    }
  }

  const handleEditService = async () => {
    if (!selectedService) return
    
    const newProfit = parseFloat(formData.service_profit) || 20
    
    try {
      let updateData: any = {
        service_name: formData.service_name,
        category_id: parseInt(formData.category_id) || 1,
        service_price: parseFloat(formData.service_price) || 0,
        service_min: parseInt(formData.service_min) || 1,
        service_max: parseInt(formData.service_max) || 1000,
        service_description: formData.service_desc,
        service_refill: formData.service_refill || 'no',
        api_serviceid: parseInt(formData.api_serviceid) || null,
        service_profit: newProfit
      }
      
      // If recalculate mode, adjust the service price to keep provider cost the same
      if (editProfitMode === "recalculate") {
        const currentPrice = parseFloat(selectedService.service_price) || 0
        const currentProfit = parseFloat(selectedService.service_profit) || 20
        
        // Calculate current provider cost: providerCost = price / (1 + profit/100)
        const currentProviderCost = currentProfit > 0 
          ? currentPrice / (1 + currentProfit / 100) 
          : currentPrice
        
        // Calculate new selling price with new profit but same provider cost:
        // newPrice = providerCost * (1 + newProfit/100)
        const newPrice = currentProviderCost * (1 + newProfit / 100)
        
        updateData.service_price = parseFloat(newPrice.toFixed(2))
        
        console.log(`Service ${selectedService.service_id}: Old price ${currentPrice}, Old profit ${currentProfit}%, New price ${updateData.service_price}, New profit ${newProfit}%`)
      }
      
      const { error } = await supabase
        .from('services')
        .update(updateData)
        .eq('service_id', selectedService.service_id)

      if (error) throw error

      const message = editProfitMode === "recalculate"
        ? `Successfully updated service with recalculated price (profit: ${newProfit}%)`
        : `Successfully updated service`
      
      alert(message)
      setShowEditModal(false)
      setSelectedService(null)
      setEditProfitMode("set")
      setFormData({ service_name: "", category_id: "", service_price: "", service_min: "", service_max: "", service_desc: "", service_refill: "no", api_serviceid: "", service_profit: "20" })
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

  // Auto-sync services from provider API
  const handleSyncServices = async () => {
    // Get API key from localStorage (stored by admin settings)
    const savedProvider = localStorage.getItem('selectedProvider') || 'smmgen'
    
    // First try to get from custom providers array
    let apiKey = ''
    try {
      const providersStr = localStorage.getItem('smmProviders')
      if (providersStr) {
        const providersList = JSON.parse(providersStr)
        const activeProv = providersList.find((p: any) => p.id === savedProvider)
        if (activeProv) apiKey = activeProv.key
      }
    } catch (e) {
      console.error('Error parsing providers:', e)
    }
    
    // Fallback to specific localStorage keys if array doesn't have it
    if (!apiKey) {
      if (savedProvider === 'smmworld') apiKey = localStorage.getItem('smmworld_api_key') || ''
      else if (savedProvider === 'smmgen') apiKey = localStorage.getItem('smmgen_api_key') || ''
      else apiKey = localStorage.getItem(`${savedProvider}_api_key`) || ''
    }
    
    if (!apiKey) {
      alert('Please configure your API key in Admin → Settings first!')
      return
    }
    
    if (!confirm('This will update existing services with new prices from the API. Continue?')) {
      return
    }
    
    setIsSyncing(true)
    
    try {
      // Get the base URL
      const baseUrl = typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://smmpanelnextjs.vercel.app'
      
      // Fetch services from provider
      const response = await fetch(`${baseUrl}/api/providers/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: savedProvider,
          apiKey: apiKey,
          action: 'services'
        })
      })
      
      const apiServices = await response.json()
      
      if (!Array.isArray(apiServices) || apiServices.length === 0) {
        alert('No services returned from API. Please check your API key.')
        setIsSyncing(false)
        return
      }
      
      // Get current profit settings
      const savedProfit = localStorage.getItem('profitPercent')
      const profitPercent = parseFloat(savedProfit || '20') || 20
      
      // Get existing services from database to match by api_serviceid
      const { data: existingServices } = await supabase
        .from('services')
        .select('service_id, api_serviceid, service_profit')
      
      const existingServiceMap = new Map()
      if (existingServices) {
        existingServices.forEach((s: any) => {
          existingServiceMap.set(s.api_serviceid?.toString(), s)
        })
      }
      
      // Update each service with matching API service
      let updatedCount = 0
      let skippedCount = 0
      
      for (const apiService of apiServices) {
        const apiServiceId = apiService.service?.toString()
        const existingService = existingServiceMap.get(apiServiceId)
        
        if (existingService) {
          // Get the stored profit for this service
          const storedProfit = parseFloat(existingService.service_profit) || profitPercent
          
          // Calculate new selling price using the SAME profit percentage
          const providerRate = parseFloat(apiService.rate) || 0
          const newSellingPrice = providerRate + (providerRate * storedProfit / 100)
          
          // Update the service with new price but keep same profit
          const { error } = await supabase
            .from('services')
            .update({ 
              service_price: parseFloat(newSellingPrice.toFixed(4))
            })
            .eq('service_id', existingService.service_id)
          
          if (!error) {
            updatedCount++
          } else {
            console.error('Error updating service:', error)
          }
        } else {
          skippedCount++
        }
      }
      
      alert(`Sync complete! Updated ${updatedCount} services. ${skippedCount} services not found in database.`)
      
      // Refresh the data
      fetchData()
      
    } catch (error) {
      console.error('Sync error:', error)
      alert('Failed to sync services. Please check your API key and try again.')
    } finally {
      setIsSyncing(false)
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
      service_refill: service.service_refill || "no",
      api_serviceid: service.api_serviceid?.toString() || "",
      service_profit: service.service_profit?.toString() || "20"
    })
    setShowEditModal(true)
  }

  const toggleServiceSelection = (serviceId: number) => {
    const newSelection = new Set(selectedServices)
    if (newSelection.has(serviceId)) {
      newSelection.delete(serviceId)
    } else {
      newSelection.add(serviceId)
    }
    setSelectedServices(newSelection)
    
    // Update current profits display for selected services
    if (newSelection.has(serviceId)) {
      const service = services.find(s => s.service_id === serviceId)
      if (service) {
        const profit = parseFloat(service.service_profit) || 20
        setCurrentProfits(prev => {
          const updated = [...prev]
          if (!updated.includes(profit)) {
            updated.push(profit)
          }
          return updated
        })
      }
    } else {
      // Remove profit when deselecting
      const service = services.find(s => s.service_id === serviceId)
      if (service) {
        const profit = parseFloat(service.service_profit) || 20
        setCurrentProfits(prev => prev.filter(p => p !== profit))
      }
    }
  }

  const selectAllFiltered = () => {
    if (selectedServices.size === filteredServices.length) {
      setSelectedServices(new Set())
      setCurrentProfits([])
    } else {
      const allIds = new Set(filteredServices.map(s => s.service_id))
      setSelectedServices(allIds)
      // Track all profits from filtered services
      const profits = filteredServices.map(s => parseFloat(s.service_profit) || 20)
      setCurrentProfits([...new Set(profits)])
    }
  }

  const handleBulkProfitUpdate = async () => {
    if (selectedServices.size === 0) {
      alert('Please select at least one service')
      return
    }
    
    const profitValue = parseFloat(bulkProfit)
    if (isNaN(profitValue) || profitValue < 0 || profitValue > 100) {
      alert('Please enter a valid profit percentage (0-100)')
      return
    }
    
    try {
      setIsLoading(true)
      const serviceIds = Array.from(selectedServices)
      
      // Get the services data for recalculation if needed
      let servicesData = services
      if (bulkProfitMode === "recalculate") {
        servicesData = services.filter(s => selectedServices.has(s.service_id))
      }
      
      // Update each service's profit
      for (const service of servicesData) {
        let updateData: any = { service_profit: profitValue }
        
        // If recalculate mode, also adjust the service price to keep provider cost the same
        if (bulkProfitMode === "recalculate") {
          const currentPrice = parseFloat(service.service_price) || 0
          const currentProfit = parseFloat(service.service_profit) || 20
          
          // Calculate current provider cost: providerCost = price / (1 + profit/100)
          const currentProviderCost = currentProfit > 0 
            ? currentPrice / (1 + currentProfit / 100) 
            : currentPrice
          
          // Calculate new selling price with new profit but same provider cost:
          // newPrice = providerCost * (1 + newProfit/100)
          const newPrice = currentProviderCost * (1 + profitValue / 100)
          
          updateData.service_price = parseFloat(newPrice.toFixed(2))
          
          console.log(`Service ${service.service_id}: Old price ${currentPrice}, Old profit ${currentProfit}%, New price ${updateData.service_price}, New profit ${profitValue}%`)
        }
        
        const { error } = await supabase
          .from('services')
          .update(updateData)
          .eq('service_id', service.service_id)
        
        if (error) {
          console.error(`Error updating service ${service.service_id}:`, error)
        }
      }
      
      const message = bulkProfitMode === "recalculate" 
        ? `Successfully recalculated prices to ${profitValue}% profit for ${serviceIds.length} services (provider cost unchanged)`
        : `Successfully updated profit to ${profitValue}% for ${serviceIds.length} services`
      
      alert(message)
      setShowBulkEditModal(false)
      setSelectedServices(new Set())
      setCurrentProfits([])
      setBulkEditMode(false)
      fetchData()
    } catch (error) {
      console.error('Error in bulk profit update:', error)
      alert('Failed to update profit for selected services')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkCategoryUpdate = async () => {
    if (selectedServices.size === 0) {
      alert('Please select at least one service')
      return
    }
    
    if (!bulkEditCategory) {
      alert('Please select a category')
      return
    }
    
    try {
      setIsLoading(true)
      const serviceIds = Array.from(selectedServices)
      
      // Update each service's category
      for (const serviceId of serviceIds) {
        const { error } = await supabase
          .from('services')
          .update({ category_id: parseInt(bulkEditCategory) })
          .eq('service_id', serviceId)
        
        if (error) {
          console.error(`Error updating service ${serviceId}:`, error)
        }
      }
      
      alert(`Successfully moved ${serviceIds.length} services to selected category`)
      setShowBulkEditModal(false)
      setSelectedServices(new Set())
      setBulkEditMode(false)
      fetchData()
    } catch (error) {
      console.error('Error in bulk category update:', error)
      alert('Failed to update category for selected services')
    } finally {
      setIsLoading(false)
    }
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
          <div className="flex items-center gap-2">
            {!bulkEditMode ? (
              <button onClick={() => setBulkEditMode(true)}
                className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-mono text-sm transition-colors">
                <Edit size={18} /> Bulk Edit
              </button>
            ) : (
              <>
                <button onClick={() => { setSelectedServices(new Set()); setBulkEditMode(false); }}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-mono text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={() => setShowBulkEditModal(true)}
                  disabled={selectedServices.size === 0}
                  className={`flex items-center gap-2 px-4 py-3 text-white rounded-xl font-mono text-sm transition-colors ${
                    selectedServices.size > 0 ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-600 cursor-not-allowed'
                  }`}>
                  Edit Selected ({selectedServices.size})
                </button>
              </>
            )}
            <button 
              onClick={handleSyncServices} 
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-mono text-sm transition-colors disabled:opacity-50"
            >
              {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />} 
              {isSyncing ? 'Syncing...' : 'Sync Prices'}
            </button>
            <button onClick={() => { setFormData({ service_name: "", category_id: "", service_price: "", service_min: "", service_max: "", service_desc: "", service_refill: "no", api_serviceid: "", service_profit: "20" }); setShowAddModal(true); }}
              className="flex items-center gap-2 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-mono text-sm transition-colors">
              <Plus size={18} /> Add Service
            </button>
          </div>
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
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-2 mb-4">
                {filteredServices.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="font-mono text-sm text-slate-400">No services found</p>
                  </div>
                ) : (
                  filteredServices.map((service) => (
                    <div key={service.service_id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedService(expandedService === service.service_id ? null : service.service_id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-white">#{service.service_id}</span>
                          <span className="font-mono text-sm text-white max-w-[150px] truncate">{service.service_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-rose-500 font-semibold">{config.symbol} {service.customer_price || Number(service.service_price || 0).toFixed(2)}</span>
                          {expandedService === service.service_id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {expandedService === service.service_id && (
                        <div className="px-4 pb-4 border-t border-slate-700 pt-4">
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                              <span className="font-mono text-xs text-slate-400">Category</span>
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-full font-mono text-xs">
                                {service.category_name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-mono text-xs text-slate-400">Min / Max</span>
                              <span className="font-mono text-xs text-slate-300">{service.service_min} / {service.service_max}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-mono text-xs text-slate-400">Cost</span>
                              <span className="font-mono text-xs text-slate-500">{config.symbol} {service.provider_price || '0.00'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(service)} className="flex-1 flex items-center justify-center gap-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                              <Edit size={14} className="text-blue-400" />
                              <span className="font-mono text-xs text-blue-400">Edit</span>
                            </button>
                            <button onClick={() => handleDeleteService(service.service_id)} className="flex-1 flex items-center justify-center gap-2 p-2 bg-slate-700 hover:bg-red-500/20 rounded-lg transition-colors">
                              <Trash2 size={14} className="text-red-400" />
                              <span className="font-mono text-xs text-red-400">Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50 border-b border-slate-700">
                    {bulkEditMode && (
                      <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">
                        <input type="checkbox" checked={selectedServices.size === filteredServices.length && filteredServices.length > 0}
                          onChange={selectAllFiltered}
                          className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500" />
                      </th>
                    )}
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">ID</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Service</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Category</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Price</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Min/Max</th>
                    <th className="text-left p-4 font-mono text-xs text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                {filteredServices.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={bulkEditMode ? 7 : 6} className="text-center p-8">
                        <p className="font-mono text-sm text-slate-400">No services found</p>
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {filteredServices.map((service) => (
                      <motion.tr key={service.service_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${selectedServices.has(service.service_id) ? 'bg-blue-500/10' : ''}`}>
                        {bulkEditMode && (
                          <td className="p-4">
                            <input type="checkbox" checked={selectedServices.has(service.service_id)}
                              onChange={() => toggleServiceSelection(service.service_id)}
                              className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500" />
                          </td>
                        )}
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
                    ))}
                  </tbody>
                )}
                  </table>
              </div>
            </>
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
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Provider Service ID</label>
                <input type="number" value={formData.api_serviceid} onChange={(e) => setFormData({...formData, api_serviceid: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="e.g., 1" />
                <p className="font-mono text-xs text-slate-500 mt-1">Provider's service ID for order submission</p>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Profit Margin (%)</label>
                <input type="number" value={formData.service_profit} onChange={(e) => setFormData({...formData, service_profit: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="20" />
                <p className="font-mono text-xs text-slate-500 mt-1">Your profit margin (e.g., 20 = 20%)</p>
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
              <button onClick={() => { setShowEditModal(false); setSelectedService(null); setEditProfitMode("set"); }} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
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
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Provider Service ID</label>
                <input type="number" value={formData.api_serviceid} onChange={(e) => setFormData({...formData, api_serviceid: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="e.g., 1" />
                <p className="font-mono text-xs text-slate-500 mt-1">Provider's service ID for order submission</p>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Profit Margin (%)</label>
                
                {/* Mode selection for edit */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setEditProfitMode("set")}
                    className={`flex-1 px-3 py-2 rounded-lg font-mono text-xs transition-colors ${
                      editProfitMode === "set" 
                        ? "bg-blue-500 text-white" 
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    Set Value
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditProfitMode("recalculate")}
                    className={`flex-1 px-3 py-2 rounded-lg font-mono text-xs transition-colors ${
                      editProfitMode === "recalculate" 
                        ? "bg-blue-500 text-white" 
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    Recalculate
                  </button>
                </div>
                
                {editProfitMode === "recalculate" && (
                  <p className="font-mono text-xs text-yellow-400 mt-2 mb-2">
                    This will recalculate the price to keep provider cost the same while changing profit
                  </p>
                )}
                
                <input type="number" value={formData.service_profit} onChange={(e) => setFormData({...formData, service_profit: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="20" />
                <p className="font-mono text-xs text-slate-500 mt-1">Your profit margin (e.g., 20 = 20%)</p>
                <p className="font-mono text-xs text-green-400 mt-1">Current: {selectedService?.service_profit || 20}%</p>
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

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-mono text-lg font-semibold text-white">Bulk Edit ({selectedServices.size} services)</h2>
              <button onClick={() => { setShowBulkEditModal(false); setCurrentProfits([]); }} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Profit Update */}
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">
                  {bulkProfitMode === "set" ? "Set Profit Percentage" : "Recalculate Prices with New Profit"}
                </label>
                
                {/* Mode selection: Set vs Recalculate */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setBulkProfitMode("set")}
                    className={`flex-1 px-3 py-2 rounded-lg font-mono text-xs transition-colors ${
                      bulkProfitMode === "set" 
                        ? "bg-blue-500 text-white" 
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    Set Value
                  </button>
                  <button
                    onClick={() => setBulkProfitMode("recalculate")}
                    className={`flex-1 px-3 py-2 rounded-lg font-mono text-xs transition-colors ${
                      bulkProfitMode === "recalculate" 
                        ? "bg-blue-500 text-white" 
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    Recalculate Prices
                  </button>
                </div>
                
                {/* Show current profits of selected services */}
                {currentProfits.length > 0 && (
                  <p className="font-mono text-xs text-green-400 mt-2 mb-2">
                    Current profit(s): {currentProfits.sort((a,b) => a-b).join("%, ")}%
                  </p>
                )}
                
                {bulkProfitMode === "recalculate" && (
                  <p className="font-mono text-xs text-yellow-400 mt-2 mb-2">
                    This will recalculate prices to keep provider cost the same while changing profit to {bulkProfit}%
                  </p>
                )}
                
                <div className="flex gap-2">
                  <input type="number" value={bulkProfit} onChange={(e) => setBulkProfit(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                    placeholder="20" min="0" max="100" />
                  <button onClick={handleBulkProfitUpdate}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-mono text-sm transition-colors">
                    {bulkProfitMode === "set" ? "Set Profit" : "Recalculate"}
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <label className="block font-mono text-xs text-slate-400 mb-2">Move to Category</label>
                <div className="flex gap-2">
                  <select value={bulkEditCategory} onChange={(e) => setBulkEditCategory(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500">
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat.category_id} value={cat.category_id.toString()}>{cat.category_name}</option>
                    ))}
                  </select>
                  <button onClick={handleBulkCategoryUpdate}
                    disabled={!bulkEditCategory}
                    className={`px-4 py-3 text-white rounded-xl font-mono text-sm transition-colors ${
                      bulkEditCategory ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-600 cursor-not-allowed'
                    }`}>
                    Move
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
