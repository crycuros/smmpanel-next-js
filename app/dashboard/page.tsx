"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useUser } from "@/hooks/use-user"
import BrutalistSidebar from "@/components/brutalist-sidebar"
import { useCurrency } from "@/hooks/useCurrency"
import { 
  ShoppingCart, 
  Wallet, 
  TrendingUp, 
  Users,
  ArrowRight,
  Activity,
  Clock,
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default function Dashboard() {
  const { user, loading } = useUser()
  const router = useRouter()
  const { formatPrice } = useCurrency()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/30 to-rose-50/50">
      <BrutalistSidebar />
      
      {/* Main Content */}
      <div className="p-6 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-sans text-3xl md:text-4xl font-light text-slate-900 mb-2">
            Welcome back, <span className="italic text-rose-500 font-semibold">{user.name || user.username || 'User'}</span>
          </h1>
          <p className="font-mono text-sm text-slate-500">Here's what's happening with your account today.</p>
        </motion.div>

        {/* Stats Grid - Rose only */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Balance", value: formatPrice(parseFloat(user.balance || '0')), icon: Wallet },
            { label: "Total Spent", value: formatPrice(parseFloat(user.spent || '0')), icon: TrendingUp },
            { label: "Total Orders", value: "0", icon: ShoppingCart },
            { label: "Referrals", value: "0", icon: Users },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-rose-50 rounded-2xl p-5 border border-rose-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-rose-400 uppercase tracking-wider">{stat.label}</span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <Icon size={18} className="text-white" />
                  </div>
                </div>
                <p className="font-sans text-2xl font-semibold text-slate-900">{stat.value}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions - Rose only */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="font-mono text-sm text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: 'New Order', icon: ShoppingCart, href: '/dashboard/new-order', desc: 'Place order' },
              { name: 'Add Funds', icon: Wallet, href: '/dashboard/add-funds', desc: 'Top up balance' },
              { name: 'Services', icon: Activity, href: '/dashboard/services', desc: 'Browse services' },
              { name: 'Orders', icon: Clock, href: '/dashboard/orders', desc: 'View all orders' },
              { name: 'Tickets', icon: Users, href: '/dashboard/tickets', desc: 'Get support' },
              { name: 'API', icon: Activity, href: '/dashboard/api', desc: 'Developer docs' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.name}
                  href={action.href}
                  className="bg-white hover:bg-rose-50 rounded-xl p-4 text-center transition-all hover:scale-105 hover:shadow-lg border border-rose-100 group"
                >
                  <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="font-mono text-xs text-slate-900 font-semibold block">{action.name}</span>
                  <span className="font-mono text-[9px] text-slate-400 block mt-1">{action.desc}</span>
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-rose-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between">
            <h2 className="font-mono text-sm text-slate-500 uppercase tracking-wider">Recent Orders</h2>
            <Link href="/dashboard/orders" className="font-mono text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="p-6 text-center">
            <p className="font-mono text-sm text-slate-500">No orders yet. Create your first order!</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
