"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import BrutalistSidebar from "@/components/brutalist-sidebar"
import { 
  MessageSquare,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  X,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface Ticket {
  id: number
  subject: string
  message: string
  status: string
  priority: string
  created_at: string
  updated_at: string
}

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  open: { 
    color: "text-yellow-600", 
    bg: "bg-yellow-100", 
    label: "Open",
    icon: Clock 
  },
  pending: { 
    color: "text-blue-600", 
    bg: "bg-blue-100", 
    label: "Pending",
    icon: AlertCircle 
  },
  solved: { 
    color: "text-green-600", 
    bg: "bg-green-100", 
    label: "Solved",
    icon: CheckCircle 
  },
  closed: { 
    color: "text-slate-600", 
    bg: "bg-slate-100", 
    label: "Closed",
    icon: XCircle 
  },
}

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: "text-green-600", label: "Low" },
  medium: { color: "text-yellow-600", label: "Medium" },
  high: { color: "text-orange-600", label: "High" },
  urgent: { color: "text-red-600", label: "Urgent" },
}

export default function Tickets() {
  const [user, setUser] = useState<any>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null)
  
  // New ticket form
  const [newSubject, setNewSubject] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [newPriority, setNewPriority] = useState("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      fetchTickets(userData.client_id)
    } else {
      router.push('/signin')
    }
  }, [router])

  const fetchTickets = async (clientId: number) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      if (data) {
        setTickets(data)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubject || !newMessage || !user) return

    setIsSubmitting(true)
    
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          client_id: user.client_id,
          subject: newSubject,
          message: newMessage,
          status: 'open',
          priority: newPriority,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setTickets([data[0], ...tickets])
      }
      
      setShowNewTicket(false)
      setNewSubject("")
      setNewMessage("")
      setNewPriority("medium")
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Failed to create ticket. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
    ticket.message.toLowerCase().includes(search.toLowerCase()) ||
    ticket.id.toString().includes(search)
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.open
  }

  const getPriorityConfig = (priority: string) => {
    return priorityConfig[priority] || priorityConfig.medium
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Calculate stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    solved: tickets.filter(t => t.status === 'solved').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/30 to-rose-50/50">
      <BrutalistSidebar />
      
      <div className="p-6 md:p-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sans text-3xl md:text-4xl font-light text-slate-900 mb-2">
                Support <span className="italic text-rose-500 font-semibold">Tickets</span>
              </h1>
              <p className="font-mono text-sm text-slate-500">Get help from our support team</p>
            </div>
            <button
              onClick={() => setShowNewTicket(true)}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-mono font-semibold transition-all hover:shadow-lg hover:shadow-rose-500/30"
            >
              <Plus size={20} />
              New Ticket
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl p-4 border border-rose-100">
            <p className="font-mono text-xs text-slate-500 uppercase">Total Tickets</p>
            <p className="font-sans text-2xl font-semibold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-rose-100">
            <p className="font-mono text-xs text-slate-500 uppercase">Open</p>
            <p className="font-sans text-2xl font-semibold text-yellow-600">{stats.open}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-rose-100">
            <p className="font-mono text-xs text-slate-500 uppercase">Solved</p>
            <p className="font-sans text-2xl font-semibold text-green-600">{stats.solved}</p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-rose-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>
        </motion.div>

        {/* Tickets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-rose-100 p-12 text-center">
              <Loader2 size={40} className="text-rose-500 animate-spin mx-auto mb-4" />
              <p className="font-mono text-sm text-slate-500">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-rose-100 p-12 text-center">
              <MessageSquare size={40} className="text-slate-300 mx-auto mb-4" />
              <p className="font-mono text-lg text-slate-500 mb-2">No tickets found</p>
              <p className="font-mono text-sm text-slate-400">Create a new ticket if you need help</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const statusConfigItem = getStatusConfig(ticket.status)
              const priorityConfigItem = getPriorityConfig(ticket.priority)
              const StatusIcon = statusConfigItem.icon
              const isExpanded = expandedTicket === ticket.id

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-rose-100 overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-rose-50/30 transition-colors"
                    onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusConfigItem.bg}`}>
                          <StatusIcon size={18} className={statusConfigItem.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-slate-400">#{ticket.id}</span>
                            <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${priorityConfigItem.color} bg-slate-100`}>
                              {priorityConfigItem.label}
                            </span>
                          </div>
                          <h3 className="font-mono text-sm font-semibold text-slate-900 mb-1">{ticket.subject}</h3>
                          <p className="font-mono text-xs text-slate-500 line-clamp-2">{ticket.message}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full font-mono text-xs ${statusConfigItem.bg} ${statusConfigItem.color}`}>
                          {statusConfigItem.label}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {formatDate(ticket.created_at)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={18} className="text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-rose-100"
                      >
                        <div className="p-4 bg-slate-50">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="font-mono text-[10px] text-slate-500 uppercase mb-1">Created</p>
                              <p className="font-mono text-xs text-slate-700">
                                {new Date(ticket.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="font-mono text-[10px] text-slate-500 uppercase mb-1">Last Updated</p>
                              <p className="font-mono text-xs text-slate-700">
                                {new Date(ticket.updated_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-xl p-4 mb-4">
                            <p className="font-mono text-[10px] text-slate-500 uppercase mb-2">Message</p>
                            <p className="font-mono text-sm text-slate-700">{ticket.message}</p>
                          </div>

                          {ticket.status !== 'solved' && ticket.status !== 'closed' && (
                            <button className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-mono text-sm font-semibold transition-colors">
                              Add Reply
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })
          )}
        </motion.div>

        {/* New Ticket Modal */}
        <AnimatePresence>
          {showNewTicket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowNewTicket(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-lg w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-mono text-lg font-semibold text-slate-900">Create New Ticket</h2>
                  <button
                    onClick={() => setShowNewTicket(false)}
                    className="p-2 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-slate-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <label className="font-mono text-xs text-slate-500 uppercase block mb-2">Subject</label>
                    <input
                      type="text"
                      placeholder="Brief description of your issue"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-rose-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-xs text-slate-500 uppercase block mb-2">Priority</label>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setNewPriority(key)}
                          className={`py-2 rounded-xl font-mono text-xs transition-colors ${
                            newPriority === key
                              ? "bg-rose-500 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-xs text-slate-500 uppercase block mb-2">Message</label>
                    <textarea
                      placeholder="Describe your issue in detail..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-slate-50 border border-rose-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !newSubject || !newMessage}
                    className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white py-4 rounded-xl font-mono font-semibold transition-all hover:shadow-lg hover:shadow-rose-500/30 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Ticket
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
