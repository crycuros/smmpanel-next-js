"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Users,
  ShoppingCart,
  Wrench,
  MessageSquare,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Tag,
  Menu,
  X,
  Home
} from "lucide-react"

interface AdminLayoutProps {
  children: ReactNode
  currentPath: string
  title: string
  description?: string
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

export default function AdminLayout({
  children,
  currentPath,
  title,
  description
}: AdminLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <Link href="/admin/dashboard" className="font-mono text-lg font-bold text-white">
          MND Admin
        </Link>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-2 bg-slate-700 rounded-lg"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-slate-700">
          <Link href="/admin/dashboard" className="font-mono text-lg font-bold text-white">
            MND Admin
          </Link>
        </div>
        
        <nav className="p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.href
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-rose-500 text-white" 
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Icon size={18} />
                <span className="font-mono text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button 
            onClick={() => {
              localStorage.removeItem('admin')
              router.push('/admin')
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:bg-slate-700 rounded-xl transition-colors"
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
      <main className="lg:ml-64 p-4 md:p-6 pt-20 lg:pt-6 pb-24 lg:pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="font-sans text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">
              {title}
            </h1>
            {description && (
              <p className="font-mono text-sm text-slate-400">{description}</p>
            )}
          </div>
          
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-50 px-2 py-2">
        <div className="flex justify-around items-center">
          {[
            { name: "Home", href: "/admin/dashboard", icon: Home },
            { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
            { name: "Services", href: "/admin/services", icon: Wrench },
            { name: "More", href: "/admin/settings", icon: Menu },
          ].map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive ? "text-rose-500" : "text-slate-400"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-mono">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
