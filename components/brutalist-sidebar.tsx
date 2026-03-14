"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useCurrency } from "@/hooks/useCurrency"
import { 
  ShoppingCart, 
  ClipboardList, 
  Wrench, 
  Wallet, 
  MessageSquare, 
  Code, 
  Users, 
  Gift, 
  RefreshCw, 
  ArrowRightLeft,
  CheckCircle,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft
} from "lucide-react"

const navItems = [
  { name: "New Order", href: "/dashboard/new-order", icon: ShoppingCart },
  { name: "Orders", href: "/dashboard/orders", icon: ClipboardList },
  { name: "Services", href: "/dashboard/services", icon: Wrench },
  { name: "Add Funds", href: "/dashboard/add-funds", icon: Wallet },
  { name: "Tickets", href: "/dashboard/tickets", icon: MessageSquare },
  { name: "API", href: "/dashboard/api", icon: Code },
  { name: "Child Panels", href: "/dashboard/child-panels", icon: Users },
  { name: "Refer & Earn", href: "/dashboard/refer", icon: Gift },
  { name: "Daily Updates", href: "/dashboard/updates", icon: RefreshCw },
  { name: "Transfer Funds", href: "/dashboard/transfer", icon: ArrowRightLeft },
  { name: "Completed Orders", href: "/dashboard/completed", icon: CheckCircle },
]

export default function BrutalistSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Update user state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      } else {
        setUser(null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    // Also check on focus to sync state
    window.addEventListener('focus', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('user')
    setUser(null)
    setIsOpen(false)
    router.push('/')
  }

  const userInitial = user?.name ? user.name[0].toUpperCase() : 
                      user?.username ? user.username[0].toUpperCase() : 
                      'U'
  const userName = user?.name || user?.username || 'User'
  const userBalance = user?.balance || '0'

  return (
    <>
      {/* Floating Toggle Button - Always visible */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 left-4 -translate-y-1/2 z-50 bg-gradient-to-br from-rose-500 to-rose-600 p-3 rounded-full hover:scale-110 transition-transform shadow-lg shadow-rose-500/40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isOpen ? (
          <PanelLeftClose size={20} className="text-white" />
        ) : (
          <PanelLeft size={20} className="text-white" />
        )}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen w-[300px] bg-white/95 backdrop-blur-xl border-r border-rose-100 z-45 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
              <span className="font-mono text-lg font-bold text-white">M</span>
            </div>
            <div>
              <h1 className="font-mono text-lg font-bold tracking-wider text-slate-900">MND</h1>
              <p className="font-mono text-[9px] text-rose-500 tracking-widest">PANEL</p>
            </div>
          </Link>
        </div>

        {/* User Info - Show actual user data */}
        <div className="mx-4 p-4 bg-gradient-to-br from-rose-50 to-white rounded-2xl border border-rose-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center shadow-md">
              <span className="font-mono text-white font-bold text-sm">{userInitial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm font-semibold text-slate-900 truncate">{userName}</p>
              <p className="font-mono text-xs text-rose-500 font-bold">{formatPrice(parseFloat(userBalance))}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-sm transition-all duration-300 ${
                    isActive 
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30" 
                      : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer - Sign Out Button */}
        <div className="p-4 flex gap-2">
          <button 
            onClick={handleSignOut}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500 hover:bg-rose-600 rounded-xl font-mono text-xs font-semibold text-white transition-colors shadow-lg shadow-rose-500/30"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}
