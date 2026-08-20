"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
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
  X,
  Check,
  Eye,
  Send,
  Tag
} from "lucide-react"

export default function AdminTickets() {
  const [user, setUser] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const router = useRouter()

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
    fetchTickets()
  }, [router])

  const fetchTickets = async () => {
    setIsLoading(true)
    try {
      // Get tickets - try ticket_id first, then id
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .order('id', { ascending: false })
        .limit(10000)

      console.log('Tickets query result:', { ticketsData, ticketsError })
      
      if (ticketsError) {
        console.error('Tickets error:', ticketsError)
      }

      console.log('Setting tickets, count:', ticketsData?.length || 0)
      
      if (ticketsData && ticketsData.length > 0) {
        // Get unique ticket_ids for fetching replies
        const ticketIds = ticketsData.map(t => t.id || t.ticket_id)
        
        // Fetch replies for these tickets
        let repliesData = null
        try {
          const result = await supabase
            .from('ticket_reply')
            .select('*')
            .in('ticket_id', ticketIds)
            .eq('support', '2') // Only admin replies
            .order('time', { ascending: false })
          repliesData = result.data
        } catch (e) {
          // ticket_reply table might not exist yet
          console.log('ticket_reply table not available')
        }
        
        // Get unique client_ids
        const clientIds = [...new Set(ticketsData.map(t => t.client_id))]
        
        // Fetch user data
        const { data: usersData } = await supabase
          .from('users')
          .select('client_id, username, email')
          .in('client_id', clientIds)
        
        // Merge user data and replies
        const ticketsWithUsers = ticketsData.map(ticket => {
          const ticketId = ticket.id || ticket.ticket_id
          const ticketReplies = repliesData?.filter(r => r.ticket_id === ticketId) || []
          return {
            ...ticket,
            ticket_id: ticketId,
            users: usersData?.find(u => u.client_id === ticket.client_id),
            replies: ticketReplies
          }
        })
        
        setTickets(ticketsWithUsers)
      } else {
        setTickets([])
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    router.push('/admin')
  }

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return
    
    try {
      // Get the ticket_id - use the field we added
      const ticketId = selectedTicket.ticket_id
      const clientId = selectedTicket.client_id
      
      // Try to insert the reply into ticket_reply table (may not exist yet)
      try {
        const { error: replyError } = await supabase
          .from('ticket_reply')
          .insert([{
            ticket_id: ticketId,
            client_id: clientId,
            time: new Date().toISOString(),
            support: '2', // 2 = from support/admin
            message: replyText,
            readed: '1'
          }])

        if (replyError) {
          console.log('Could not insert to ticket_reply:', replyError)
        }
      } catch (e) {
        console.log('ticket_reply table not available')
      }

      // Update the ticket status to 'answered'
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          status: 'answered'
        })
        .eq('id', ticketId)

      if (updateError) throw updateError

      setSelectedTicket(null)
      setReplyText("")
      fetchTickets()
    } catch (error) {
      console.error('Error replying to ticket:', error)
      alert('Failed to send reply')
    }
  }

  const handleCloseTicket = async (ticketId: number) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'closed'
        })
        .eq('id', ticketId)

      if (error) throw error

      fetchTickets()
    } catch (error) {
      console.error('Error closing ticket:', error)
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

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.id?.toString().includes(searchQuery) ||
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.users?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.users?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || t.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    closed: tickets.filter(t => t.status === 'closed').length,
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
          <MessageSquare size={20} className="text-white" />
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
          <h1 className="font-sans text-3xl font-bold text-white mb-2">Support Tickets</h1>
          <p className="font-mono text-sm text-slate-400">Manage customer support tickets</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-slate-400 uppercase">Total</p>
            <p className="font-mono text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-green-500 uppercase">Open</p>
            <p className="font-mono text-2xl font-bold text-green-500">{stats.open}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="font-mono text-xs text-slate-400 uppercase">Closed</p>
            <p className="font-mono text-2xl font-bold text-slate-400">{stats.closed}</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-rose-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStatusFilter("all")} className={`px-4 py-2 rounded-xl font-mono text-sm transition-colors ${statusFilter === "all" ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>All</button>
              <button onClick={() => setStatusFilter("open")} className={`px-4 py-2 rounded-xl font-mono text-sm transition-colors ${statusFilter === "open" ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>Open</button>
              <button onClick={() => setStatusFilter("closed")} className={`px-4 py-2 rounded-xl font-mono text-sm transition-colors ${statusFilter === "closed" ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>Closed</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={32} className="text-rose-500 animate-spin" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
              <p className="font-mono text-sm text-slate-400">No tickets found</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 rounded-2xl border border-slate-700 p-4 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-slate-400">#{ticket.id}</span>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-xs ${ticket.status === 'open' ? 'bg-green-500/20 text-green-500' : 'bg-slate-600 text-slate-300'}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <h3 className="font-mono text-sm text-white mb-1">{ticket.subject}</h3>
                    <p className="font-mono text-xs text-slate-400 mb-2">From: {ticket.users?.username || ticket.users?.email || 'Unknown'}</p>
                    <p className="font-mono text-xs text-slate-500 line-clamp-2">{ticket.message}</p>
                    {ticket.replies && ticket.replies.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {ticket.replies.slice(0, 1).map((reply: any) => (
                          <div key={reply.id} className="p-3 bg-slate-700/50 rounded-xl">
                            <p className="font-mono text-xs text-rose-500 mb-1">Admin Reply:</p>
                            <p className="font-mono text-xs text-slate-300">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { 
                      const latestReply = ticket.replies && ticket.replies.length > 0 ? ticket.replies[0].message : ''
                      setSelectedTicket(ticket); 
                      setReplyText(latestReply); 
                    }} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                      <Eye size={14} className="text-blue-400" />
                    </button>
                    {ticket.status !== 'closed' && (
                      <button onClick={() => handleCloseTicket(ticket.ticket_id)} className="p-2 bg-slate-700 hover:bg-green-500/20 rounded-lg transition-colors">
                        <Check size={14} className="text-green-400" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="font-mono text-xs text-slate-500 mt-3">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '-'}</p>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-mono text-lg font-semibold text-white">Ticket #{selectedTicket.id}</h2>
              <button onClick={() => { setSelectedTicket(null); setReplyText(""); }} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Subject</label>
                <p className="font-mono text-sm text-white">{selectedTicket.subject}</p>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">From</label>
                <p className="font-mono text-sm text-slate-300">{selectedTicket.users?.username || selectedTicket.users?.email}</p>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Message</label>
                <div className="p-3 bg-slate-700/50 rounded-xl">
                  <p className="font-mono text-sm text-slate-300">{selectedTicket.message}</p>
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Reply</label>
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500 h-32 resize-none" placeholder="Type your reply..." />
              </div>
              <button onClick={handleReply} disabled={!replyText.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-mono text-sm transition-colors">
                <Send size={18} /> Send Reply & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
