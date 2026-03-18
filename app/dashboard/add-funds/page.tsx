"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import BrutalistSidebar from "@/components/brutalist-sidebar"
import { useCurrency } from "@/hooks/useCurrency"
import { 
  Wallet,
  CheckCircle,
  Copy,
  Shield,
  Clock,
  MessageCircle,
  Phone
} from "lucide-react"

const GCASH_NUMBER = "09565082558"

export default function AddFunds() {
  const [user, setUser] = useState<any>(null)
  const [copiedNum, setCopiedNum] = useState(false)
  const router = useRouter()
  const { formatPrice } = useCurrency()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push('/signin')
    }
  }, [router])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedNum(true)
    setTimeout(() => setCopiedNum(false), 2000)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/30 to-rose-50/50">
      <BrutalistSidebar />
      
      <div className="p-6 md:p-8 pt-20 pb-24 md:pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-sans text-3xl md:text-4xl font-light text-slate-900 mb-2">
            Add <span className="italic text-rose-500 font-semibold">Funds</span>
          </h1>
          <p className="font-mono text-sm text-slate-500">Scan QR to pay via GCash</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-rose-100 uppercase mb-1">Current Balance</p>
              <p className="font-sans text-4xl font-bold">{formatPrice(parseFloat(user.balance || '0'))}</p>
            </div>
            <Wallet size={32} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          
          {/* Static QR Code */}
          <div className="bg-white rounded-2xl border border-rose-100 p-6 mb-6">
            <h2 className="font-mono text-sm text-slate-500 uppercase mb-4">GCash QR</h2>
            
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-xl border-2 border-rose-200 shadow-lg">
                <img 
                  src="/QR Code.png" 
                  alt="GCash QR Code" 
                  className="w-96 h-96 object-contain"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl">
              <Phone size={16} className="text-slate-500" />
              <span className="font-mono text-sm text-slate-600">GCash:</span>
              <span className="font-mono text-lg font-bold text-slate-900">{GCASH_NUMBER}</span>
              <button onClick={() => copyToClipboard(GCASH_NUMBER)} className="p-1 hover:bg-slate-200 rounded">
                {copiedNum ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-2xl border border-rose-100 p-6 mb-6">
            <h3 className="font-mono text-sm text-slate-500 uppercase mb-4">How to Pay</h3>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-mono">1</span>
                <span className="font-mono text-sm text-slate-600">Open GCash app</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-mono">2</span>
                <span className="font-mono text-sm text-slate-600">Tap "Scan QR" and scan the QR above</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-mono">3</span>
                <span className="font-mono text-sm text-slate-600">Enter amount and confirm payment</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-mono">4</span>
                <span className="font-mono text-sm text-slate-600">Screenshot receipt and send to Telegram/Discord</span>
              </li>
            </ol>
          </div>

          {/* Submit Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <a href="https://t.me/YOUR_CHANNEL" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-4 bg-[#0088cc] hover:bg-[#0077b3] rounded-xl transition-colors">
              <MessageCircle size={20} className="text-white" />
              <span className="font-mono text-sm text-white">Telegram</span>
            </a>
            <a href="https://discord.gg/YOUR_SERVER" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-4 bg-[#5865F2] hover:bg-[#4752C4] rounded-xl transition-colors">
              <MessageCircle size={20} className="text-white" />
              <span className="font-mono text-sm text-white">Discord</span>
            </a>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="font-mono text-xs text-yellow-700">⏱️ Processing: 5-15 mins. Message if no confirmation after 30 mins.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-rose-100 p-6">
          <h2 className="font-mono text-sm text-slate-500 uppercase mb-4">Recent</h2>
          <div className="text-center py-6 text-slate-400">
            <Clock size={32} className="mx-auto mb-2" />
            <p className="font-mono text-sm">No transactions</p>
          </div>
        </motion.div>

        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
          <Shield size={16} />
          <p className="font-mono text-xs">Secure</p>
        </div>
      </div>
    </div>
  )
}
