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
  Loader2,
  Save,
  Bell,
  Shield,
  Globe,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Layers,
  Package,
  ArrowRight
} from "lucide-react"

// Pre-defined SMM providers
const DEFAULT_PROVIDERS = [
  {
    id: "smmgen",
    name: "SMMGen",
    url: "https://my.smmgen.com/api/v2",
    key: "",
    currency: "USD"
  },
  {
    id: "generic",
    name: "Generic API",
    url: "https://example.com/api",
    key: "",
    currency: "PHP"
  }
]

interface Provider {
  id: string
  name: string
  url: string
  key: string
  currency?: string
}

interface ProviderCategory {
  id: string
  name: string
  services: ProviderService[]
}

interface ProviderService {
  service: string
  name: string
  rate: string
  min: string
  max: string
}

export default function AdminSettings() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  // 2FA State
  const [totpEnabled, setTotpEnabled] = useState(false)
  const [qrCodeURL, setQrCodeURL] = useState("")
  const [totpSecret, setTotpSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading2FA, setIsLoading2FA] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState("smmgen")
  const [profitPercent, setProfitPercent] = useState("20")
  const [providers, setProviders] = useState<Provider[]>([
    { id: "smmgen", name: "SMMGen", url: "https://my.smmgen.com/api/v2", key: "" },
    { id: "generic", name: "Generic API", url: "https://example.com/api", key: "" }
  ])
  const [customProviders, setCustomProviders] = useState<Provider[]>([])
  const [showAddProvider, setShowAddProvider] = useState(false)
  const [newProvider, setNewProvider] = useState({ name: "", url: "", key: "" })
  
  // Enhanced Import Services state
  const [providerCategories, setProviderCategories] = useState<ProviderCategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [showRoutingModal, setShowRoutingModal] = useState(false)
  const [partialSelections, setPartialSelections] = useState<{category: string, services: string[]}[]>([])
  const [routingOption, setRoutingOption] = useState<"new" | "existing" | "standalone">("new")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [existingCategoryId, setExistingCategoryId] = useState<string>("")
  
  const router = useRouter()
  const { currency, config } = useCurrency()

  const [settings, setSettings] = useState({
    siteName: "MND - Market Next Door",
    siteDescription: "Best SMM Panel in the Philippines",
    supportEmail: "support@mndph.com",
    currency: "PHP",
    timezone: "Asia/Manila",
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerification: false,
    telegram: "",
    facebook: "",
    instagram: "",
    countryCurrencies: {
      PH: 'PHP',
      US: 'USD',
      GB: 'GBP',
      EU: 'EUR',
      JP: 'JPY',
      KR: 'KRW',
      SG: 'SGD',
      MY: 'MYR',
      TH: 'THB',
      ID: 'IDR',
      VN: 'VND',
      CN: 'CNY',
      IN: 'INR',
      AU: 'AUD',
      CA: 'CAD',
    }
  })

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
    
    // Load saved settings
    const savedSettings = localStorage.getItem('siteSettings')
    if (savedSettings) {
      setSettings({...settings, ...JSON.parse(savedSettings)})
    }
    
    // Load saved providers with keys
    const savedProviders = localStorage.getItem('smmProviders')
    if (savedProviders) {
      const parsed = JSON.parse(savedProviders)
      // Deduplicate providers by id to prevent duplicate key errors
      const uniqueProviders = parsed.filter((p: Provider, index: number, self: Provider[]) => 
        self.findIndex((x: Provider) => x.id === p.id) === index
      )
      // Migrate old weboostph/smmworld keys to smmgen
      const migratedProviders = uniqueProviders.map((p: Provider) => {
        if ((p.id === 'weboostph' || p.id === 'smmworld') && p.key) {
          return { ...p, id: 'smmgen', name: 'SMMGen', url: 'https://my.smmgen.com/api/v2' }
        }
        return p
      }).filter((p: Provider, index: number, self: Provider[]) => self.findIndex((x: Provider) => x.id === p.id) === index)
      
      setCustomProviders(migratedProviders.filter((p: Provider) => !['smmgen', 'generic'].includes(p.id)))
      
      // Use smmgen key from migrated providers
      const smmgenKey = migratedProviders.find((p: Provider) => p.id === 'smmgen')?.key || ''
      setProviders([
        { id: "smmgen", name: "SMMGen", url: "https://my.smmgen.com/api/v2", key: smmgenKey },
        ...migratedProviders.filter((p: Provider) => p.id !== 'smmgen')
      ])
    } else {
      setProviders([
        { id: "smmgen", name: "SMMGen", url: "https://my.smmgen.com/api/v2", key: "" },
        { id: "generic", name: "Generic API", url: "https://example.com/api", key: "" }
      ])
    }
    
    // Load selected provider
    const savedProvider = localStorage.getItem('selectedProvider')
    if (savedProvider) {
      // Migrate old providers to smmgen
      if (savedProvider === 'weboostph' || savedProvider === 'smmworld') {
        setSelectedProvider('smmgen')
        localStorage.setItem('selectedProvider', 'smmgen')
      } else {
        setSelectedProvider(savedProvider)
      }
    }
    
    // Load profit percent
    const savedProfit = localStorage.getItem('profitPercent')
    if (savedProfit) {
      setProfitPercent(savedProfit)
    }
  }, [router])

  // Check if 2FA is enabled
  useEffect(() => {
    const check2FA = async () => {
      if (!user?.email) return
      try {
        const { data } = await supabase
          .from('clients')
          .select('totp_secret')
          .eq('email', user.email)
          .single()
        if (data?.totp_secret) {
          setTotpEnabled(true)
        }
      } catch (err) {
        console.error('Error checking 2FA:', err)
      }
    }
    if (user?.email) check2FA()
  }, [user])

  // 2FA Setup Functions
  const setup2FA = async () => {
    if (!user?.email) return
    setIsLoading2FA(true)
    try {
      const response = await fetch('/api/auth/setup-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      })
      const data = await response.json()
      if (data.qrCodeURL) {
        setQrCodeURL(data.qrCodeURL)
        setTotpSecret(data.secret)
      } else {
        alert(data.error || 'Failed to setup 2FA')
      }
    } catch (err) {
      console.error('2FA setup error:', err)
    }
    setIsLoading2FA(false)
  }

  const verify2FA = async () => {
    if (!user?.email || verificationCode.length !== 6) return
    try {
      const response = await fetch('/api/auth/setup-totp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code: verificationCode })
      })
      const data = await response.json()
      if (data.success) {
        setTotpEnabled(true)
        setQrCodeURL("")
        setTotpSecret("")
        setVerificationCode("")
        alert('2FA enabled successfully!')
      } else {
        alert(data.error || 'Verification failed')
      }
    } catch (err) {
      console.error('2FA verify error:', err)
    }
  }

  const allProviders = [...DEFAULT_PROVIDERS, ...customProviders]

  const handleLogout = () => {
    localStorage.removeItem('admin')
    router.push('/admin')
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    localStorage.setItem('siteSettings', JSON.stringify(settings))
    
    // Also save to API for currency detection
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
    } catch (error) {
      console.error('Error saving settings to API:', error)
    }
    
    // Deduplicate before saving
    const uniqueProviders = customProviders.filter((p: Provider, index: number, self: Provider[]) => 
      self.findIndex((x: Provider) => x.id === p.id) === index
    )
    localStorage.setItem('smmProviders', JSON.stringify(uniqueProviders))
    localStorage.setItem('selectedProvider', selectedProvider)
    localStorage.setItem('profitPercent', profitPercent)
    setIsSaving(false)
    alert('Settings saved successfully!')
  }

  const handleAddProvider = () => {
    if (!newProvider.name || !newProvider.url) return
    
    const provider: Provider = {
      id: `custom_${Date.now()}`,
      name: newProvider.name,
      url: newProvider.url,
      key: newProvider.key
    }
    
    const updatedCustomProviders = [...customProviders, provider]
    setCustomProviders(updatedCustomProviders)
    
    // Auto-save to localStorage
    const allUpdatedProviders = [
      { id: "weboostph", name: "WeBoostPH", url: "https://weboostph.biz/api/v2", key: providers.find(p => p.id === "weboostph")?.key || "" },
      { id: "generic", name: "Generic API", url: "https://example.com/api", key: "" },
      ...updatedCustomProviders
    ].filter((p: Provider, index: number, self: Provider[]) => self.findIndex((x: Provider) => x.id === p.id) === index)
    localStorage.setItem('smmProviders', JSON.stringify(allUpdatedProviders))
    
    setNewProvider({ name: "", url: "", key: "" })
    setShowAddProvider(false)
  }

  const handleDeleteProvider = (id: string) => {
    const updatedCustomProviders = customProviders.filter(p => p.id !== id)
    setCustomProviders(updatedCustomProviders)
    
    // Auto-save to localStorage
    const allUpdatedProviders = [
      { id: "weboostph", name: "WeBoostPH", url: "https://weboostph.biz/api/v2", key: providers.find(p => p.id === "weboostph")?.key || "" },
      { id: "generic", name: "Generic API", url: "https://example.com/api", key: "" },
      ...updatedCustomProviders
    ].filter((p: Provider, index: number, self: Provider[]) => self.findIndex((x: Provider) => x.id === p.id) === index)
    localStorage.setItem('smmProviders', JSON.stringify(allUpdatedProviders))
  }

  // Fetch categories from provider API
  const handleFetchCategories = async () => {
    const provider = allProviders.find(p => p.id === selectedProvider)
    if (!provider) {
      setImportStatus({type: 'error', message: 'Please select a provider'})
      return
    }
    
    if (!provider.key) {
      setImportStatus({type: 'error', message: 'Please enter API key for selected provider'})
      return
    }
    
    setIsLoadingCategories(true)
    setImportStatus(null)
    
    try {
      // Use server-side API route to avoid CORS issues
      const response = await fetch('/api/providers/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: provider.id,
          apiKey: provider.key,
          action: 'services'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch services from API')
      }
      
      const data = await response.json()
      
      console.log('API Response:', data)
      
      if (!Array.isArray(data)) {
        throw new Error(data.error || data.message || 'Invalid response from API: ' + JSON.stringify(data))
      }
      
      // Group services by category
      const categoryMap = new Map<string, ProviderService[]>()
      
      for (const service of data) {
        const categoryName = service.category || 'Uncategorized'
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, [])
        }
        categoryMap.get(categoryName)!.push({
          service: service.service,
          name: service.name,
          rate: service.rate,
          min: service.min,
          max: service.max
        })
      }
      
      // Convert to array with IDs
      const categories: ProviderCategory[] = Array.from(categoryMap.entries()).map(([name, services], index) => ({
        id: `cat_${index}`,
        name,
        services
      }))
      
      setProviderCategories(categories)
      setSelectedCategories(new Set())
      setSelectedServices(new Set())
      setExpandedCategories(new Set())
      
    } catch (error: any) {
      setImportStatus({type: 'error', message: error.message || 'Failed to fetch categories'})
    } finally {
      setIsLoadingCategories(false)
    }
  }

  // Toggle category selection (bulk select all services in category)
  const handleToggleCategory = (categoryId: string) => {
    const category = providerCategories.find(c => c.id === categoryId)
    if (!category) return
    
    const newSelectedCategories = new Set(selectedCategories)
    const newSelectedServices = new Set(selectedServices)
    
    if (newSelectedCategories.has(categoryId)) {
      // Deselect all services in this category
      newSelectedCategories.delete(categoryId)
      category.services.forEach(s => newSelectedServices.delete(s.service))
    } else {
      // Select all services in this category
      newSelectedCategories.add(categoryId)
      category.services.forEach(s => newSelectedServices.add(s.service))
    }
    
    setSelectedCategories(newSelectedCategories)
    setSelectedServices(newSelectedServices)
  }

  // Toggle individual service selection
  const handleToggleService = (categoryId: string, serviceId: string) => {
    const newSelectedServices = new Set(selectedServices)
    const newSelectedCategories = new Set(selectedCategories)
    
    if (newSelectedServices.has(serviceId)) {
      newSelectedServices.delete(serviceId)
      newSelectedCategories.delete(categoryId)
    } else {
      newSelectedServices.add(serviceId)
    }
    
    // Check if all services in category are selected
    const category = providerCategories.find(c => c.id === categoryId)
    if (category) {
      const allServiceIds = category.services.map(s => s.service)
      const allSelected = allServiceIds.every(id => newSelectedServices.has(id))
      
      if (allSelected) {
        newSelectedCategories.add(categoryId)
      }
    }
    
    setSelectedServices(newSelectedServices)
    setSelectedCategories(newSelectedCategories)
  }

  // Toggle category expansion
  const handleToggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Check if category is fully selected
  const isCategoryFullySelected = (categoryId: string) => {
    return selectedCategories.has(categoryId)
  }

  // Check if category is partially selected
  const isCategoryPartiallySelected = (categoryId: string) => {
    const category = providerCategories.find(c => c.id === categoryId)
    if (!category) return false
    
    const categoryServiceIds = category.services.map(s => s.service)
    const selectedCount = categoryServiceIds.filter(id => selectedServices.has(id)).length
    
    return selectedCount > 0 && selectedCount < categoryServiceIds.length
  }

  // Select all / deselect all categories
  const handleToggleAllCategories = () => {
    const allCategoryIds = providerCategories.map(c => c.id)
    const allSelected = allCategoryIds.length > 0 && allCategoryIds.every(id => selectedCategories.has(id))

    if (allSelected) {
      setSelectedCategories(new Set())
      setSelectedServices(new Set())
    } else {
      const newSelectedCategories = new Set(allCategoryIds)
      const newSelectedServices = new Set<string>()
      providerCategories.forEach(c => c.services.forEach(s => newSelectedServices.add(s.service)))
      setSelectedCategories(newSelectedCategories)
      setSelectedServices(newSelectedServices)
    }
  }

  // Get selected services count
  const getSelectedCount = () => {
    return selectedServices.size
  }

  const handleImportServices = async () => {
    const provider = allProviders.find(p => p.id === selectedProvider)
    if (!provider) {
      setImportStatus({type: 'error', message: 'Please select a provider'})
      return
    }

    if (!provider.key) {
      setImportStatus({type: 'error', message: 'Please enter API key for selected provider'})
      return
    }
    
    // Check if any services are selected
    if (selectedServices.size === 0) {
      setImportStatus({type: 'error', message: 'Please select at least one service to import'})
      return
    }
    
    // Detect partial categories (categories where not all services are selected)
    const partialCats: {category: string, services: string[]}[] = []
    
    for (const cat of providerCategories) {
      const categoryServiceIds = cat.services.map(s => s.service)
      const selectedInCategory = categoryServiceIds.filter(id => selectedServices.has(id))
      
      // If some but not all services are selected in this category
      if (selectedInCategory.length > 0 && selectedInCategory.length < categoryServiceIds.length) {
        partialCats.push({
          category: cat.name,
          services: selectedInCategory
        })
      }
    }
    
    // If there are partial categories, show routing modal
    if (partialCats.length > 0) {
      setPartialSelections(partialCats)
      setShowRoutingModal(true)
      return
    }
    
    // Proceed with import
    await processImport(provider, selectedServices, selectedCategories, providerCategories)
  }

  // Process the actual import
  const processImport = async (
    prov: Provider, 
    selectedSvs: Set<string>, 
    selectedCats: Set<string>, 
    categories: ProviderCategory[]
  ) => {
    const provider = prov
    const profit = parseFloat(profitPercent) || 0
    setIsImporting(true)
    setImportStatus(null)
    setShowRoutingModal(false)
    
    try {
      // Get existing categories from database
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('category_id, category_name')

      // Create a map of category names to IDs
      const categoryMap = new Map()
      existingCategories?.forEach((cat: any) => {
        categoryMap.set(cat.category_name.toLowerCase(), cat.category_id)
      })

      // Process services and insert them
      let importedCount = 0
      let skippedCount = 0

      for (const category of categories) {
        // Get selected service IDs for this category
        const categorySelectedServiceIds = category.services
          .filter(s => selectedSvs.has(s.service))
          .map(s => s.service)
        
        if (categorySelectedServiceIds.length === 0) continue
        
        // Determine category name based on routing
        let categoryName = category.name
        
        // If partial selection with routing, category was already set in modal
        const partialMatch = partialSelections.find(p => p.category === category.name)
        if (partialMatch) {
          // Use the routed category name
          if (routingOption === "new") {
            categoryName = newCategoryName || category.name
          } else if (routingOption === "existing") {
            // Get category name from existing ID
            const existingCat = existingCategories?.find((c: any) => c.category_id === parseInt(existingCategoryId))
            if (existingCat) categoryName = existingCat.category_name
          }
          // For standalone, we'll use a special handling
        }
        
        // Find or create category
        let categoryId = categoryMap.get(categoryName.toLowerCase())
        
        if (!categoryId) {
          // Insert new category with provider source indicator for full selections
          const categoryToInsert = { category_name: categoryName }
          
          const { data: newCategory, error: catError } = await supabase
            .from('categories')
            .insert([categoryToInsert])
            .select('category_id')
            .single()
          
          if (!catError && newCategory) {
            categoryId = newCategory.category_id
            categoryMap.set(categoryName.toLowerCase(), categoryId)
          }
        }

        if (!categoryId) {
          categoryId = 1
        }

        // Process selected services in this category
        for (const svc of category.services) {
          if (!selectedSvs.has(svc.service)) continue
          
          // Calculate price with profit - convert USD to PHP first if needed
          const basePrice = parseFloat(svc.rate) || 0
          // Convert USD to PHP (1 USD = 56 PHP) for SMMWORLD, then add profit
          const providerCurrency = (prov as any).currency || 'PHP'
          const phpPrice = providerCurrency === 'USD' ? basePrice * 56 : basePrice
          const sellingPrice = phpPrice + (phpPrice * profit / 100)

          // Check if service already exists (by name and category)
          // Use ilike for case-insensitive match to handle special characters better
          const { data: existingService } = await supabase
            .from('services')
            .select('service_id')
            .ilike('service_name', svc.name)
            .eq('category_id', categoryId)
            .maybeSingle()

          if (existingService) {
            // Update existing service
            const { error: updateError } = await supabase
              .from('services')
              .update({
                service_price: sellingPrice,
                service_profit: profit.toString(),
                service_min: parseInt(svc.min) || 1,
                service_max: parseInt(svc.max) || 100000,
                service_description: `Min: ${svc.min}, Max: ${svc.max}, Rate: ${svc.rate}`,
                api_provider: provider.id
              })
              .eq('service_id', existingService.service_id)
            
            if (updateError) {
              console.error('Update error:', updateError)
            }
            skippedCount++
          } else {
            // Insert new service
            const { error: insertError } = await supabase
              .from('services')
              .insert([{
                service_name: svc.name,
                category_id: categoryId,
                service_price: sellingPrice,
                service_profit: profit.toString(),
                service_min: parseInt(svc.min) || 1,
                service_max: parseInt(svc.max) || 100000,
                service_description: `Min: ${svc.min}, Max: ${svc.max}, Rate: ${svc.rate}`,
                service_type: 'default',
                api_provider: provider.id
              }])
            
            if (insertError) {
              console.error('Insert error for service:', svc.name, insertError)
            } else {
              importedCount++
            }
          }
        }
      }

      setImportStatus({
        type: 'success',
        message: `Import complete! ${importedCount} new services imported, ${skippedCount} updated. Profit: ${profit}%`
      })

    } catch (error: any) {
      console.error('Import error:', error)
      setImportStatus({
        type: 'error',
        message: error.message || 'Failed to import services'
      })
    } finally {
      setIsImporting(false)
    }
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

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "import", label: "Import Services", icon: Download },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ]

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
          <Settings size={20} className="text-white" />
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 ${
                  item.name === 'Settings' ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700"
                }`}>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-sans text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="font-mono text-sm text-slate-400">Manage your site settings</p>
          </div>
          <button onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-600 text-white rounded-xl font-mono text-sm transition-colors">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 bg-slate-800 rounded-2xl border border-slate-700 p-4 h-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors mb-2 ${
                    activeTab === tab.id ? "bg-rose-500 text-white" : "text-slate-300 hover:bg-slate-700"
                  }`}>
                  <Icon size={18} />
                  <span className="font-mono text-sm">{tab.label}</span>
                </button>
              )
            })}
          </div>

          <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="font-mono text-lg font-semibold text-white mb-4">General Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-slate-400 mb-2">Site Name</label>
                    <input type="text" value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-slate-400 mb-2">Support Email</label>
                    <input type="email" value={settings.supportEmail} onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-slate-400 mb-2">Currency</label>
                    <select value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500">
                      <option value="PHP">₱ PHP (Philippine Peso)</option>
                      <option value="USD">$ USD (US Dollar)</option>
                      <option value="EUR">€ EUR (Euro)</option>
                      <option value="GBP">£ GBP (British Pound)</option>
                      <option value="JPY">¥ JPY (Japanese Yen)</option>
                      <option value="KRW">₩ KRW (Korean Won)</option>
                      <option value="SGD">S$ SGD (Singapore Dollar)</option>
                      <option value="MYR">RM MYR (Malaysian Ringgit)</option>
                      <option value="THB">฿ THB (Thai Baht)</option>
                      <option value="IDR">Rp IDR (Indonesian Rupiah)</option>
                      <option value="VND">₫ VND (Vietnamese Dong)</option>
                      <option value="CNY">¥ CNY (Chinese Yuan)</option>
                      <option value="INR">₹ INR (Indian Rupee)</option>
                      <option value="AUD">A$ AUD (Australian Dollar)</option>
                      <option value="CAD">C$ CAD (Canadian Dollar)</option>
                    </select>
                    <p className="font-mono text-xs text-slate-500 mt-1">Default currency for visitors</p>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-slate-400 mb-2">Timezone</label>
                    <select value={settings.timezone} onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500">
                      <option value="Asia/Manila">Asia/Manila (PHT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                {/* Country-based Currency Settings Hehey*/}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="font-mono text-sm text-white font-semibold mb-4">Country-Based Currency</h3>
                  <p className="font-mono text-xs text-slate-400 mb-4">Set currency based on visitor's country (AUTODETECT)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(settings.countryCurrencies || {}).map(([country, currency]) => (
                      <div key={country} className="flex items-center gap-2 bg-slate-700/50 p-3 rounded-xl">
                        <span className="font-mono text-sm text-white w-12">{country}</span>
                        <span className="text-slate-400">→</span>
                        <select 
                          value={currency} 
                          onChange={(e) => setSettings({
                            ...settings, 
                            countryCurrencies: {
                              ...settings.countryCurrencies,
                              [country]: e.target.value
                            }
                          })}
                          className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-rose-500">
                          <option value="PHP">₱ PHP</option>
                          <option value="USD">$ USD</option>
                          <option value="EUR">€ EUR</option>
                          <option value="GBP">£ GBP</option>
                          <option value="JPY">¥ JPY</option>
                          <option value="KRW">₩ KRW</option>
                          <option value="SGD">S$ SGD</option>
                          <option value="MYR">RM MYR</option>
                          <option value="THB">฿ THB</option>
                          <option value="IDR">Rp IDR</option>
                          <option value="VND">₫ VND</option>
                          <option value="CNY">¥ CNY</option>
                          <option value="INR">₹ INR</option>
                          <option value="AUD">A$ AUD</option>
                          <option value="CAD">C$ CAD</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-2">Site Description</label>
                  <textarea value={settings.siteDescription} onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500 h-24 resize-none" />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-white">Maintenance Mode</p>
                      <p className="font-mono text-xs text-slate-400">Show maintenance page to users</p>
                    </div>
                    <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                      className={`w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? "bg-rose-500" : "bg-slate-600"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.maintenanceMode ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-white">User Registration</p>
                      <p className="font-mono text-xs text-slate-400">Allow new users to register</p>
                    </div>
                    <button onClick={() => setSettings({...settings, registrationEnabled: !settings.registrationEnabled})}
                      className={`w-12 h-6 rounded-full transition-colors ${settings.registrationEnabled ? "bg-rose-500" : "bg-slate-600"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.registrationEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "import" && (
              <div className="space-y-6">
                <h2 className="font-mono text-lg font-semibold text-white mb-4">Import Services from Provider</h2>
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="font-mono text-sm text-blue-400 mb-2">Import services from external SMM API provider</p>
                  <p className="font-mono text-xs text-slate-400">Select a provider, set your profit margin, fetch categories, then select services to import.</p>
                </div>

                {/* Select Provider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono text-xs text-slate-400">Choose Provider</label>
                    <button onClick={() => setShowAddProvider(!showAddProvider)} className="text-blue-400 text-xs hover:underline">
                      + Add New Provider
                    </button>
                  </div>
                  <select value={selectedProvider} onChange={(e) => {
                    setSelectedProvider(e.target.value)
                    setProviderCategories([])
                    setSelectedCategories(new Set())
                    setSelectedServices(new Set())
                  }}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500">
                    <option value="">Select a provider</option>
                    <optgroup label="Default Providers">
                      {DEFAULT_PROVIDERS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                    {customProviders.length > 0 && (
                      <optgroup label="Custom Providers">
                        {customProviders.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* API Key Input */}
                {selectedProvider && (
                  <div>
                    <label className="block font-mono text-xs text-slate-400 mb-2">API Key</label>
                    <input 
                      type="text" 
                      value={allProviders.find(p => p.id === selectedProvider)?.key || ""} 
                      onChange={(e) => {
                        const provider = allProviders.find(p => p.id === selectedProvider)
                        if (provider) {
                          provider.key = e.target.value
                          setProviders([...DEFAULT_PROVIDERS, ...customProviders])
                          // Auto-save API key to localStorage
                          const updatedProviders = [...DEFAULT_PROVIDERS, ...customProviders].map(p => 
                            p.id === selectedProvider ? { ...p, key: e.target.value } : p
                          ).filter((p: Provider, index: number, self: Provider[]) => self.findIndex((x: Provider) => x.id === p.id) === index)
                          localStorage.setItem('smmProviders', JSON.stringify(updatedProviders))
                        }
                      }}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                      placeholder="Enter API key"
                    />
                  </div>
                )}

                {/* Profit Percent */}
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-2">Profit Percentage (%)</label>
                  <input 
                    type="number" 
                    value={profitPercent} 
                    onChange={(e) => setProfitPercent(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                    placeholder="20"
                    min="0"
                    max="100"
                  />
                  <p className="font-mono text-xs text-slate-400 mt-1">
                    Example: If provider price is {config.symbol}10 and profit is 20%, your price will be {config.symbol}12
                  </p>
                </div>

                {/* Fetch Categories Button */}
                <button 
                  onClick={handleFetchCategories} 
                  disabled={isLoadingCategories || !selectedProvider || !allProviders.find(p => p.id === selectedProvider)?.key}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 text-white rounded-xl font-mono text-sm transition-colors"
                >
                  {isLoadingCategories ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Loading Categories...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      Fetch Categories from Provider
                    </>
                  )}
                </button>

                {/* Categories Side Panel */}
                {providerCategories.length > 0 && (
                  <div className="border border-slate-600 rounded-xl overflow-hidden">
                    <div className="bg-slate-800 p-4 border-b border-slate-600 flex items-center justify-between">
                      <div>
                        <h3 className="font-mono text-sm text-white font-semibold">Available Categories</h3>
                        <p className="font-mono text-xs text-slate-400">{providerCategories.length} categories, {providerCategories.reduce((acc, c) => acc + c.services.length, 0)} services</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleToggleAllCategories}
                          className="font-mono text-xs text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          {providerCategories.length > 0 && providerCategories.every(c => selectedCategories.has(c.id)) ? 'Deselect All' : 'Select All'}
                        </button>
                        <p className="font-mono text-sm text-rose-400">{getSelectedCount()} selected</p>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto bg-slate-900">
                      {providerCategories.map(category => (
                        <div key={category.id} className="border-b border-slate-700 last:border-b-0">
                          {/* Category Header */}
                          <div 
                            className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-800 ${isCategoryFullySelected(category.id) ? 'bg-rose-500/20' : isCategoryPartiallySelected(category.id) ? 'bg-yellow-500/20' : ''}`}
                            onClick={() => handleToggleCategory(category.id)}
                          >
                            <input 
                              type="checkbox" 
                              checked={isCategoryFullySelected(category.id)}
                              onChange={() => handleToggleCategory(category.id)}
                              className="w-4 h-4 rounded accent-rose-500"
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <span className="font-mono text-sm text-white">{category.name}</span>
                              <div className="flex items-center gap-2">
                                {isCategoryPartiallySelected(category.id) && (
                                  <span className="text-xs bg-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded">Partial</span>
                                )}
                                <span className="font-mono text-xs text-slate-400">{category.services.length} services</span>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleExpand(category.id)
                              }}
                              className="p-1 hover:bg-slate-700 rounded"
                            >
                              {expandedCategories.has(category.id) ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                            </button>
                          </div>
                          
                          {/* Individual Services */}
                          {expandedCategories.has(category.id) && (
                            <div className="bg-slate-800/50 p-2 pl-8 space-y-1">
                              {category.services.map(service => (
                                <div 
                                  key={service.service}
                                  className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded cursor-pointer"
                                  onClick={() => handleToggleService(category.id, service.service)}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={selectedServices.has(service.service)}
                                    onChange={() => handleToggleService(category.id, service.service)}
                                    className="w-3 h-3 rounded accent-rose-500"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-mono text-xs text-white truncate">{service.name}</p>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-400">{selectedProvider === 'smmworld' ? '$' : '₱'}{service.rate}</span>
                                    <span className="text-slate-500">({service.min}-{service.max})</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Provider Form */}
                {showAddProvider && (
                  <div className="p-4 bg-slate-700/50 rounded-xl space-y-4">
                    <h3 className="font-mono text-sm text-white">Add Custom Provider</h3>
                    <div>
                      <label className="block font-mono text-xs text-slate-400 mb-2">Provider Name</label>
                      <input 
                        type="text" 
                        value={newProvider.name} 
                        onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                        placeholder="e.g., MySMMProvider"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-slate-400 mb-2">API URL</label>
                      <input 
                        type="text" 
                        value={newProvider.url} 
                        onChange={(e) => setNewProvider({...newProvider, url: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                        placeholder="https://provider.com/api"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAddProvider} className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-mono text-sm">
                        Add Provider
                      </button>
                      <button onClick={() => setShowAddProvider(false)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-mono text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {importStatus && (
                  <div className={`p-4 rounded-xl ${importStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <div className="flex items-center gap-2">
                      {importStatus.type === 'success' ? <CheckCircle size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-red-500" />}
                      <p className={`font-mono text-sm ${importStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {importStatus.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Import Selected Button */}
                <button onClick={handleImportServices} disabled={isImporting || !selectedProvider || getSelectedCount() === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white rounded-xl font-mono text-sm transition-colors w-full justify-center">
                  {isImporting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Importing {getSelectedCount()} Services...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Import {getSelectedCount()} Selected Services
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="font-mono text-lg font-semibold text-white mb-4">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-white">Email Notifications</p>
                      <p className="font-mono text-xs text-slate-400">Receive email for new orders</p>
                    </div>
                    <button className="w-12 h-6 bg-rose-500 rounded-full">
                      <div className="w-5 h-5 bg-white rounded-full translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-white">Telegram Notifications</p>
                      <p className="font-mono text-xs text-slate-400">Receive Telegram messages for new orders</p>
                    </div>
                    <button className="w-12 h-6 bg-slate-600 rounded-full">
                      <div className="w-5 h-5 bg-white rounded-full translate-x-0.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <h3 className="font-mono text-sm text-white mb-4">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-slate-400 mb-2">Telegram</label>
                      <input type="text" value={settings.telegram} onChange={(e) => setSettings({...settings, telegram: e.target.value})}
                        placeholder="@username" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500" />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-slate-400 mb-2">Facebook</label>
                      <input type="text" value={settings.facebook} onChange={(e) => setSettings({...settings, facebook: e.target.value})}
                        placeholder="facebook.com/..." className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500" />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-slate-400 mb-2">Instagram</label>
                      <input type="text" value={settings.instagram} onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                        placeholder="@username" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="font-mono text-lg font-semibold text-white mb-4">Security Settings</h2>
                
                {/* 2FA Setup */}
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-mono text-sm text-white">Google Authenticator 2FA</p>
                      <p className="font-mono text-xs text-slate-400">
                        {totpEnabled ? "✓ Enabled" : "Not enabled"}
                      </p>
                    </div>
                    {!totpEnabled && (
                      <button 
                        onClick={setup2FA}
                        disabled={isLoading2FA}
                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-mono text-xs"
                      >
                        {isLoading2FA ? "Loading..." : "Setup"}
                      </button>
                    )}
                  </div>
                  
                  {/* QR Code */}
                  {qrCodeURL && (
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <p className="text-xs text-center text-slate-600 mb-2">Scan with Google Authenticator</p>
                      <img src={qrCodeURL} alt="QR" className="w-40 h-40 mx-auto" />
                      <p className="text-[10px] text-center text-slate-500 mt-2 break-all">Secret: {totpSecret}</p>
                      <div className="mt-3">
                        <input 
                          type="text" 
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter code"
                          className="w-full px-3 py-2 border rounded-lg text-center font-mono text-sm"
                        />
                        <button 
                          onClick={verify2FA}
                          disabled={verificationCode.length !== 6}
                          className="w-full mt-2 px-3 py-2 bg-green-500 text-white rounded-lg font-mono text-xs disabled:opacity-50"
                        >
                          Verify & Enable
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-white">Two-Factor Authentication</p>
                      <p className="font-mono text-xs text-slate-400">Require 2FA for admin login</p>
                    </div>
                    <button className="w-12 h-6 bg-rose-500 rounded-full">
                      <div className="w-5 h-5 bg-white rounded-full translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-white">Email Verification</p>
                      <p className="font-mono text-xs text-slate-400">Require email verification for registration</p>
                    </div>
                    <button onClick={() => setSettings({...settings, emailVerification: !settings.emailVerification})}
                      className={`w-12 h-6 rounded-full transition-colors ${settings.emailVerification ? "bg-rose-500" : "bg-slate-600"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.emailVerification ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <h3 className="font-mono text-sm text-white mb-4">Change Admin Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-mono text-xs text-slate-400 mb-2">Current Password</label>
                      <input type="password" placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500" />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-slate-400 mb-2">New Password</label>
                      <input type="password" placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500" />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-slate-400 mb-2">Confirm New Password</label>
                      <input type="password" placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500" />
                    </div>
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-mono text-sm transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Routing Modal for Partial Category Selection */}
      {showRoutingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-yellow-500" />
              <h3 className="font-mono text-lg text-white font-semibold">Partial Category Selection Detected</h3>
            </div>
            
            <p className="font-mono text-sm text-slate-300">
              You've selected only some services from the following categories. Choose how to handle them:
            </p>
          
          <p className="font-mono text-sm text-slate-300">
            You've selected only some services from the following categories. Choose how to handle them:
          </p>
          
          <div className="bg-slate-700/50 rounded-xl p-4 max-h-40 overflow-y-auto">
            {partialSelections.map((partial, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1">
                <Layers size={14} className="text-rose-400" />
                <span className="font-mono text-sm text-white">{partial.category}</span>
                <span className="text-xs text-slate-400">({partial.services.length} services)</span>
              </div>
            ))}
          </div>
          
          {/* Routing Options */}
          <div className="space-y-3">
            <label className="block font-mono text-xs text-slate-400">Route partial selections to:</label>
            
            <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border ${routingOption === 'new' ? 'bg-rose-500/20 border-rose-500' : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'}`}>
              <input 
                type="radio" 
                name="routing" 
                checked={routingOption === 'new'} 
                onChange={() => setRoutingOption('new')}
                className="accent-rose-500"
              />
              <Package size={18} className="text-slate-400" />
              <div>
                <p className="font-mono text-sm text-white">Create New Category</p>
                <p className="font-mono text-xs text-slate-400">Add selected services to a new custom category</p>
              </div>
            </label>
            
            {routingOption === 'new' && (
              <div className="ml-8">
                <input 
                  type="text" 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter new category name"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            )}
            
            <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border ${routingOption === 'existing' ? 'bg-rose-500/20 border-rose-500' : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'}`}>
              <input 
                type="radio" 
                name="routing" 
                checked={routingOption === 'existing'} 
                onChange={() => setRoutingOption('existing')}
                className="accent-rose-500"
              />
              <Layers size={18} className="text-slate-400" />
              <div>
                <p className="font-mono text-sm text-white">Merge with Existing Category</p>
                <p className="font-mono text-xs text-slate-400">Add to an existing category in your panel</p>
              </div>
            </label>
            
            {routingOption === 'existing' && (
              <div className="ml-8">
                <input 
                  type="text" 
                  value={existingCategoryId} 
                  onChange={(e) => setExistingCategoryId(e.target.value)}
                  placeholder="Enter existing category ID"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            )}
            
            <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border ${routingOption === 'standalone' ? 'bg-rose-500/20 border-rose-500' : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'}`}>
              <input 
                type="radio" 
                name="routing" 
                checked={routingOption === 'standalone'} 
                onChange={() => setRoutingOption('standalone')}
                className="accent-rose-500"
              />
              <ArrowRight size={18} className="text-slate-400" />
              <div>
                <p className="font-mono text-sm text-white">Keep as Standalone Services</p>
                <p className="font-mono text-xs text-slate-400">Add services without a category (use Uncategorized)</p>
              </div>
            </label>
          </div>
          
          {/* Modal Actions */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => {
                setShowRoutingModal(false)
                setPartialSelections([])
              }}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-mono text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={() => processImport(
                allProviders.find(p => p.id === selectedProvider)!,
                selectedServices,
                selectedCategories,
                providerCategories
              )}
              disabled={routingOption === 'new' && !newCategoryName}
              className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-600 text-white rounded-xl font-mono text-sm"
            >
              Import Selected
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)
}
