"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useCurrency } from "@/hooks/useCurrency"
import AdminLayout from "@/components/admin-layout"
import { 
  Tag,
  Edit,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Package,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  List,
  Plus,
  Trash2,
  Filter,
  X,
  Folder,
  Square,
  CheckSquare,
  GripVertical,
  ExternalLink,
  Merge,
  RefreshCw,
  BarChart3
} from "lucide-react"

interface Category {
  category_id: number
  category_name: string
  service_count?: number
}

interface Service {
  service_id: number
  service_name: string
  service_price: number
  service_api: string
  category_id: number
}

export default function AdminCategories() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<'categories' | 'services'>('categories')
  const [services, setServices] = useState<Service[]>([])
  const [totalServicesCount, setTotalServicesCount] = useState<number>(0)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set())
  const [isReordering, setIsReordering] = useState(false)
  const { currency, config } = useCurrency()
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [serviceCountInCategory, setServiceCountInCategory] = useState(0)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [mergeTargetCategory, setMergeTargetCategory] = useState<string>("")
  const [categoriesToMerge, setCategoriesToMerge] = useState<number[]>([])

  // AdminLayout handles navigation

  useEffect(() => {
    const adminData = localStorage.getItem('admin')
    if (adminData) {
      const userData = JSON.parse(adminData)
      setUser(userData)
      fetchCategories()
    } else {
      router.push('/signin')
    }
  }, [router])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      // Fetch ALL categories with pagination (Supabase default limit is 1000)
      const pageSize = 1000
      let allCategories: any[] = []
      let from = 0
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('categories')
          .select('category_id, category_name')
          .order('category_id', { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allCategories = [...allCategories, ...data]
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }

      // Get total services count
      const { count: totalServicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })

      setTotalServicesCount(totalServicesCount || 0)

      // Fetch all services with pagination
      const svcPageSize = 1000
      let allServices: any[] = []
      let svcFrom = 0
      let svcHasMore = true

      while (svcHasMore) {
        const { data: servicesPage, error: svcError } = await supabase
          .from('services')
          .select('service_id, service_name, service_price, service_api, category_id')
          .order('service_id', { ascending: true })
          .range(svcFrom, svcFrom + svcPageSize - 1)

        if (svcError) throw svcError

        if (servicesPage && servicesPage.length > 0) {
          allServices = [...allServices, ...servicesPage]
          svcFrom += svcPageSize
          svcHasMore = servicesPage.length === svcPageSize
        } else {
          svcHasMore = false
        }
      }

      setServices(allServices)
      
      // Count services per category
      const serviceCounts: Record<number, number> = {}
      allServices.forEach((service: any) => {
        if (service.category_id) {
          serviceCounts[service.category_id] = (serviceCounts[service.category_id] || 0) + 1
        }
      })
      
      // Merge counts into categories
      const categoriesWithCounts = (allCategories || []).map((cat: any) => ({
        ...cat,
        service_count: serviceCounts[cat.category_id] || 0
      }))
      
      setCategories(categoriesWithCounts)
    } catch (err: any) {
      console.error('Error loading categories:', err)
      setSaveStatus({ type: 'error', message: 'Failed to load categories' })
    } finally {
      setIsLoading(false)
    }
  }

  const getServicesForCategory = (categoryId: number): Service[] => {
    return services.filter(s => s.category_id === categoryId)
  }

  const toggleExpandCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleStartEdit = (categoryId: number, currentName: string) => {
    setEditingCategory(categoryId)
    setEditingName(currentName)
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditingName("")
  }

  const handleSaveCategory = async (categoryId: number) => {
    if (!editingName.trim()) {
      setSaveStatus({ type: 'error', message: 'Category name cannot be empty' })
      return
    }
    
    try {
      const { error } = await supabase
        .from('categories')
        .update({ category_name: editingName.trim() })
        .eq('category_id', categoryId)
      
      if (error) throw error
      
      setCategories(categories.map(cat => 
        cat.category_id === categoryId ? { ...cat, category_name: editingName.trim() } : cat
      ))
      setSaveStatus({ type: 'success', message: 'Category updated successfully!' })
      setEditingCategory(null)
      setEditingName("")
      
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err: any) {
      console.error('Error updating category:', err)
      setSaveStatus({ type: 'error', message: err.message || 'Failed to update category' })
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setSaveStatus({ type: 'error', message: 'Category name cannot be empty' })
      return
    }
    
    try {
      const maxId = categories.length > 0 ? Math.max(...categories.map(c => c.category_id)) : 0
      
      const { error } = await supabase
        .from('categories')
        .insert([{ 
          category_name: newCategoryName.trim(),
          category_id: maxId + 1
        }])
      
      if (error) throw error
      
      setSaveStatus({ type: 'success', message: 'Category created successfully!' })
      setNewCategoryName("")
      setShowAddModal(false)
      fetchCategories()
      
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err: any) {
      console.error('Error adding category:', err)
      setSaveStatus({ type: 'error', message: err.message || 'Failed to add category' })
    }
  }

  const handleDeleteClick = async (category: Category) => {
    const servicesInCategory = services.filter(s => s.category_id === category.category_id).length
    setServiceCountInCategory(servicesInCategory)
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return
    
    try {
      if (serviceCountInCategory > 0) {
        const { error: updateError } = await supabase
          .from('services')
          .update({ category_id: 1 })
          .eq('category_id', categoryToDelete.category_id)
        
        if (updateError) throw updateError
      }
      
      const { error } = await supabase
        .from('categories')
        .update({ category_deleted: '1' })
        .eq('category_id', categoryToDelete.category_id)
      
      if (error) throw error
      
      setSaveStatus({ 
        type: 'success', 
        message: serviceCountInCategory > 0 
          ? `Category deleted! ${serviceCountInCategory} services moved to category 1.`
          : 'Category deleted successfully!'
      })
      setShowDeleteModal(false)
      setCategoryToDelete(null)
      fetchCategories()
      
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err: any) {
      console.error('Error deleting category:', err)
      setSaveStatus({ type: 'error', message: err.message || 'Failed to delete category' })
    }
  }

  // Bulk selection
  const toggleSelectCategory = (categoryId: number) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedCategories.size === filteredCategories.length) {
      setSelectedCategories(new Set())
    } else {
      setSelectedCategories(new Set(filteredCategories.map(c => c.category_id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCategories.size === 0) return
    
    try {
      // Move services to category 1 before deleting
      const categoriesToDelete = Array.from(selectedCategories)
      for (const catId of categoriesToDelete) {
        const servicesInCat = services.filter(s => s.category_id === catId).length
        if (servicesInCat > 0) {
          await supabase
            .from('services')
            .update({ category_id: 1 })
            .eq('category_id', catId)
        }
        
        await supabase
          .from('categories')
          .update({ category_deleted: '1' })
          .eq('category_id', catId)
      }
      
      setSaveStatus({ 
        type: 'success', 
        message: `${selectedCategories.size} categories deleted successfully!`
      })
      setSelectedCategories(new Set())
      setShowBulkDeleteModal(false)
      fetchCategories()
      
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err: any) {
      console.error('Error bulk deleting:', err)
      setSaveStatus({ type: 'error', message: err.message || 'Failed to delete categories' })
    }
  }

  // Open merge modal with selected categories
  const openMergeModal = () => {
    if (selectedCategories.size < 2) {
      setSaveStatus({ type: 'error', message: 'Select at least 2 categories to merge' })
      setTimeout(() => setSaveStatus(null), 3000)
      return
    }
    const categoriesArray = Array.from(selectedCategories)
    setCategoriesToMerge(categoriesArray)
    // Set default target to LAST selected category
    setMergeTargetCategory(categoriesArray[categoriesArray.length - 1].toString())
    setShowMergeModal(true)
  }

  // Handle merge categories
  const handleMergeCategories = async () => {
    if (!mergeTargetCategory || categoriesToMerge.length < 2) return
    
    const targetId = parseInt(mergeTargetCategory)
    const sourceIds = categoriesToMerge.filter(id => id !== targetId)
    
    try {
      // Move all services from source categories to target category
      for (const sourceId of sourceIds) {
        const { error: updateError } = await supabase
          .from('services')
          .update({ category_id: targetId })
          .eq('category_id', sourceId)
        
        if (updateError) throw updateError
        
        // Soft delete the source category
        const { error: deleteError } = await supabase
          .from('categories')
          .update({ category_deleted: '1' })
          .eq('category_id', sourceId)
        
        if (deleteError) throw deleteError
      }
      
      setSaveStatus({ 
        type: 'success', 
        message: `Merged ${sourceIds.length} categories into target category!`
      })
      setSelectedCategories(new Set())
      setShowMergeModal(false)
      setCategoriesToMerge([])
      fetchCategories()
      
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err: any) {
      console.error('Error merging categories:', err)
      setSaveStatus({ type: 'error', message: err.message || 'Failed to merge categories' })
    }
  }

  // Drag and drop reorder
  const handleReorder = async (newOrder: Category[]) => {
    setCategories(newOrder)
    
    try {
      for (let i = 0; i < newOrder.length; i++) {
        const { error } = await supabase
          .from('categories')
          .update({ category_id: i + 1 })
          .eq('category_id', newOrder[i].category_id)
        
        if (error) throw error
      }
      setSaveStatus({ type: 'success', message: 'Category order updated!' })
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (err: any) {
      console.error('Error reordering:', err)
      setSaveStatus({ type: 'error', message: 'Failed to save category order' })
      fetchCategories() // Refresh on error
    }
  }

  const filteredCategories = categories.filter((cat: Category) =>
    cat.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredServices = services.filter(s => {
    const matchesSearch = s.service_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategoryFilter === 'all' || s.category_id?.toString() === selectedCategoryFilter
    return matchesSearch && matchesCategory
  })

  const totalServices = totalServicesCount || services.length
  const totalCategories = categories.length

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 size={40} className="text-rose-500 animate-spin" />
      </div>
    )
  }

  return (
    <AdminLayout 
      currentPath="/admin/categories" 
      title="Categories" 
      description="Manage your service categories"
    >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="hidden sm:block">
              {/* Spacer for layout consistency */}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsReordering(!isReordering)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm transition-colors ${
                  isReordering ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <GripVertical size={18} />
                {isReordering ? 'Done Sorting' : 'Sort'}
              </button>
              <button
                onClick={async () => {
                  // Sync from external API via server-side route (fixes CORS)
                  const apiKey = process.env.NEXT_PUBLIC_SMM_API_KEY
                  const apiUrl = process.env.NEXT_PUBLIC_SMM_API_URL
                  if (!apiKey || !apiUrl) {
                    setSaveStatus({ type: 'error', message: 'API not configured' })
                    return
                  }
                  setIsSyncing(true)
                  setSyncProgress({ current: 0, total: 0 })
                  setSaveStatus({ type: 'success', message: 'Syncing from API...' })
                  try {
                    // Call our server-side API to fetch from external API (bypasses CORS)
                    const syncRes = await fetch('/api/sync-services', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ apiKey, apiUrl })
                    })
                    const syncData = await syncRes.json()
                    
                    if (syncData.error) {
                      throw new Error(syncData.error)
                    }
                    
                    const { categories: catData, services: svcData } = syncData
                    
                    if (catData && Array.isArray(catData) && catData.length > 0) {
                      // Delete existing and insert new
                      setSyncProgress({ current: 0, total: catData.length })
                      await supabase.from('categories').delete().gt('category_id', -1)
                      await supabase.from('categories').insert(catData)
                    }
                    
                    if (svcData && Array.isArray(svcData) && svcData.length > 0) {
                      setSyncProgress({ current: 0, total: svcData.length })
                      // Delete existing and insert new (original behavior)
                      await supabase.from('services').delete().gt('service_id', -1)
                      await supabase.from('services').insert(svcData)
                      setSyncProgress({ current: svcData.length, total: svcData.length })
                    }
                    
                    setIsSyncing(false)
                    setSaveStatus({ type: 'success', message: `Synced ${syncData.stats?.categoriesCount || 0} categories and ${syncData.stats?.servicesCount || 0} services!` })
                    fetchCategories()
                  } catch (err: any) {
                    console.error('Sync error:', err)
                    setIsSyncing(false)
                    const errorMsg = err.message || 'Failed to sync from API'
                    setSaveStatus({ type: 'error', message: errorMsg })
                  }
                  setTimeout(() => setSaveStatus(null), 5000)
                }}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl font-mono text-sm transition-colors"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Updating Services {syncProgress.total > 0 ? `${syncProgress.current}/${syncProgress.total}` : '...'}
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Sync from API
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-mono text-sm transition-colors"
              >
                <Plus size={18} />
                Add Category
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-5 bg-slate-800 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/20 rounded-lg">
                  <Folder size={20} className="text-rose-400" />
                </div>
                <div>
                  <p className="font-mono text-xs text-slate-400 uppercase">Total Categories</p>
                  <p className="font-mono text-2xl text-white font-bold">{totalCategories}</p>
                </div>
              </div>
            </div>
            <div className="p-5 bg-slate-800 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Package size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="font-mono text-xs text-slate-400 uppercase">Total Services</p>
                  <p className="font-mono text-2xl text-white font-bold">{totalServices}</p>
                </div>
              </div>
            </div>
            <div className="p-5 bg-slate-800 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <BarChart3 size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="font-mono text-xs text-slate-400 uppercase">Avg Services/Category</p>
                  <p className="font-mono text-2xl text-white font-bold">
                    {totalCategories > 0 ? Math.round(totalServices / totalCategories) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedCategories.size > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between"
            >
              <p className="font-mono text-sm text-rose-400">
                {selectedCategories.size} category(ies) selected
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCategories(new Set())}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-mono text-sm"
                >
                  Clear Selection
                </button>
                {selectedCategories.size >= 2 && (
                  <button
                    onClick={openMergeModal}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-mono text-sm flex items-center gap-2"
                  >
                    <Merge size={16} />
                    Merge ({selectedCategories.size})
                  </button>
                )}
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-mono text-sm flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Selected
                </button>
              </div>
            </motion.div>
          )}

          {/* View Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => { setViewMode('categories'); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm ${viewMode === 'categories' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                <Grid3X3 size={16} />
                Categories
              </button>
              <button
                onClick={() => { setViewMode('services'); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm ${viewMode === 'services' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                <List size={16} />
                Services
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={viewMode === 'categories' ? "Search categories..." : "Search services..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
            {viewMode === 'services' && (
              <div className="relative md:w-64">
                <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500 appearance-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id.toString()}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Status Message */}
          {saveStatus && (
            <div className={`mb-6 p-4 rounded-xl ${saveStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <p className={`font-mono text-sm ${saveStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {saveStatus.message}
              </p>
            </div>
          )}

          {/* Content based on view mode */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="text-rose-500 animate-spin" />
            </div>
          ) : viewMode === 'services' ? (
            /* Services View */
            filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="font-mono text-slate-400">No services found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredServices.map(service => {
                  const category = categories.find(c => c.category_id === service.category_id)
                  return (
                    <motion.div 
                      key={service.service_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                          <Package size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="font-mono text-white text-sm">{service.service_name}</p>
                          <p className="font-mono text-xs text-slate-500">
                            ID: {service.service_id} • {category?.category_name || 'Unknown'} • API: {service.service_api || 'None'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-mono text-green-400 text-sm">{currency}{Number(service.service_price || 0).toFixed(2)}</p>
                        <button 
                          onClick={() => router.push('/admin/services')}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg"
                          title="Edit in Services"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Tag size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="font-mono text-slate-400">No categories found</p>
            </div>
          ) : isReordering ? (
            /* Reorder Mode */
            <Reorder.Group axis="y" values={filteredCategories} onReorder={handleReorder} className="space-y-3">
              {filteredCategories.map((category) => (
                <Reorder.Item 
                  key={category.category_id} 
                  value={category}
                  className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 cursor-move"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical size={20} className="text-slate-500" />
                    <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
                      <Tag size={18} className="text-rose-400" />
                    </div>
                    <div>
                      <span className="font-mono text-white">{category.category_name}</span>
                      <span className="ml-3 font-mono text-xs text-slate-500">ID: {category.category_id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 rounded-lg">
                    <Package size={14} className="text-blue-400" />
                    <span className="font-mono text-xs text-blue-400">{category.service_count || 0}</span>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            /* Categories View with Expandable Services */
            <div className="space-y-3">
              {/* Select All */}
              <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-4">
                <button
                  onClick={toggleSelectAll}
                  className="p-1"
                >
                  {selectedCategories.size === filteredCategories.length && filteredCategories.length > 0 ? (
                    <CheckSquare size={20} className="text-rose-400" />
                  ) : (
                    <Square size={20} className="text-slate-500" />
                  )}
                </button>
                <span className="font-mono text-sm text-slate-400">Select all</span>
              </div>

              {filteredCategories.map((category, index) => {
                const isExpanded = expandedCategories.has(category.category_id)
                const categoryServices = getServicesForCategory(category.category_id)
                
                return (
                  <motion.div 
                    key={category.category_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between p-4">
                      {editingCategory === category.category_id ? (
                        <div className="flex-1 flex items-center gap-3">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveCategory(category.category_id)
                              if (e.key === 'Escape') handleCancelEdit()
                            }}
                          />
                          <button onClick={() => handleSaveCategory(category.category_id)}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={handleCancelEdit}
                            className="p-2 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded-lg">
                            <AlertCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleSelectCategory(category.category_id)}
                              className="p-1"
                            >
                              {selectedCategories.has(category.category_id) ? (
                                <CheckSquare size={20} className="text-rose-400" />
                              ) : (
                                <Square size={20} className="text-slate-500" />
                              )}
                            </button>
                            
                            {/* Expand Button */}
                            <button
                              onClick={() => toggleExpandCategory(category.category_id)}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              <ChevronRight 
                                size={20} 
                                className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              />
                            </button>

                            {/* Drag Handle (hidden but available) */}
                            <div className="hidden">
                              <GripVertical size={20} className="text-slate-500" />
                            </div>

                            {/* Category Info */}
                            <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
                              <Tag size={18} className="text-rose-400" />
                            </div>
                            <div>
                              <span className="font-mono text-white">{category.category_name}</span>
                              <span className="ml-3 font-mono text-xs text-slate-500">ID: {category.category_id}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 rounded-lg">
                              <Package size={14} className="text-blue-400" />
                              <span className="font-mono text-xs text-blue-400">{category.service_count || 0}</span>
                            </div>
                            <button onClick={() => handleStartEdit(category.category_id, category.category_name)}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors">
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(category)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Delete category"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Expanded Services List */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-700"
                        >
                          {categoryServices.length === 0 ? (
                            <div className="p-4 text-center">
                              <p className="font-mono text-sm text-slate-500">No services in this category</p>
                            </div>
                          ) : (
                            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                              {categoryServices.map(service => (
                                <div 
                                  key={service.service_id}
                                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <Package size={14} className="text-slate-400" />
                                    <span className="font-mono text-sm text-white">{service.service_name}</span>
                                    <span className="font-mono text-xs text-slate-500">ID: {service.service_id}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono text-green-400 text-sm">{currency}{Number(service.service_price || 0).toFixed(2)}</span>
                                    <button 
                                      onClick={() => router.push('/admin/services')}
                                      className="p-1 text-slate-400 hover:text-rose-400"
                                      title="Edit in Services"
                                    >
                                      <ExternalLink size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="font-mono text-xs text-slate-500">
              {viewMode === 'services' 
                ? `Showing ${filteredServices.length} of ${services.length} services` 
                : `Total: ${filteredCategories.length} categories • ${filteredCategories.reduce((sum, cat) => sum + (cat.service_count || 0), 0)} services`}
            </p>
          </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-mono text-xl text-white font-semibold">Add New Category</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block font-mono text-xs text-slate-400 mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory()
                    if (e.key === 'Escape') setShowAddModal(false)
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-mono text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddCategory}
                  className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-mono text-sm transition-colors"
                >
                  Create Category
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Category Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <AlertCircle size={24} className="text-red-400" />
                </div>
                <h2 className="font-mono text-xl text-white font-semibold">Delete Category</h2>
              </div>
              
              <p className="font-mono text-sm text-slate-300 mb-4">
                Are you sure you want to delete <span className="text-white font-semibold">"{categoryToDelete?.category_name}"</span>?
              </p>
              
              {serviceCountInCategory > 0 && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="font-mono text-sm text-yellow-400">
                    ⚠️ This category contains <span className="font-bold">{serviceCountInCategory}</span> service(s). 
                    They will be moved to category ID 1 (Uncategorized).
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-mono text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-mono text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Modal */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBulkDeleteModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <Trash2 size={24} className="text-red-400" />
                </div>
                <h2 className="font-mono text-xl text-white font-semibold">Bulk Delete Categories</h2>
              </div>
              
              <p className="font-mono text-sm text-slate-300 mb-4">
                Are you sure you want to delete <span className="text-white font-bold">{selectedCategories.size}</span> categories?
              </p>

              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="font-mono text-sm text-yellow-400">
                  ⚠️ Services in these categories will be moved to category ID 1 (Uncategorized).
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-mono text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-mono text-sm transition-colors"
                >
                  Delete {selectedCategories.size} Categories
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Merge Categories Modal */}
      <AnimatePresence>
        {showMergeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMergeModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Merge size={24} className="text-blue-400" />
                </div>
                <h2 className="font-mono text-xl text-white font-semibold">Merge Categories</h2>
              </div>
              
              <p className="font-mono text-sm text-slate-300 mb-4">
                Select the target category to merge {categoriesToMerge.length} categories into:
              </p>

              <div className="mb-4 p-3 bg-slate-700/50 rounded-xl">
                <p className="font-mono text-xs text-slate-400 mb-2">Categories to merge:</p>
                <div className="flex flex-wrap gap-2">
                  {categoriesToMerge.map(catId => {
                    const cat = categories.find(c => c.category_id === catId)
                    return (
                      <span key={catId} className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded-lg font-mono text-xs">
                        {cat?.category_name || `ID: ${catId}`}
                      </span>
                    )
                  })}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block font-mono text-xs text-slate-400 mb-2">Merge into category:</label>
                <select
                  value={mergeTargetCategory}
                  onChange={(e) => setMergeTargetCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500 appearance-none cursor-pointer"
                >
                  {categoriesToMerge.map(catId => {
                    const cat = categories.find(c => c.category_id === catId)
                    return (
                      <option key={catId} value={catId.toString()}>
                        {cat?.category_name || `ID: ${catId}`} ({cat?.service_count || 0} services)
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowMergeModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-mono text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleMergeCategories}
                  className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-mono text-sm transition-colors"
                >
                  Merge Categories
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
