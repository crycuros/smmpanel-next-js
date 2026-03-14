export const dynamic = 'force-dynamic'

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import BrutalistSidebar from "@/components/brutalist-sidebar"
import { useCurrency } from "@/hooks/useCurrency"
import { 
  Wallet,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Copy,
  Upload,
  Loader2,
  Shield,
  Clock
} from "lucide-react"

interface PaymentMethod {
  id: string
  name: string
  icon: any
  description: string
  instructions: string[]
  minAmount: number
  maxAmount: number
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "gcash",
    name: "GCash",
    icon: Smartphone,
    description: "Pay using your GCash account",
    instructions: [
      "Enter the amount you want to deposit",
      "Click the payment method to generate QR code",
      "Scan the QR code using your GCash app",
      "Complete the payment and wait for confirmation"
    ],
    minAmount: 100,
    maxAmount: 50000
  },
  {
    id: "paymaya",
    name: "PayMaya",
    icon: CreditCard,
    description: "Pay using your PayMaya account",
    instructions: [
      "Enter the amount you want to deposit",
      "Click the payment method to generate payment code",
      "Open your PayMaya app and scan the QR code",
      "Complete the payment and wait for confirmation"
    ],
    minAmount: 100,
    maxAmount: 50000
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: Banknote,
    description: "Direct bank transfer (BPI, BDO, Metrobank)",
    instructions: [
      "Copy the bank account details provided",
      "Transfer the amount from your bank app or online banking",
      "Take a screenshot of your transfer receipt",
      "Upload the receipt and submit"
    ],
    minAmount: 500,
    maxAmount: 100000
  },
  {
    id: "crypto",
    name: "Cryptocurrency",
    icon: Shield,
    description: "Pay with USDT (TRC20)",
    instructions: [
      "Copy the USDT wallet address",
      "Transfer USDT from your wallet to our address",
      "Wait for blockchain confirmation (usually 1-3 minutes)",
      "Your balance will be updated automatically"
    ],
    minAmount: 500,
    maxAmount: 500000
  }
]

interface Transaction {
  id: string
  amount: number
  method: string
  status: string
  created_at: string
}

export default function AddFunds() {
  const [user, setUser] = useState<any>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const { currency, config, convertPrice, formatPrice } = useCurrency()
  
  // Philippine payment methods always use PHP
  const phpConfig = {
    symbol: '₱',
    exchangeRate: 1,
    name: 'Philippine Peso'
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
    } else {
      router.push('/signin')
    }
  }, [router])

  const handleAmountChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '')
    setAmount(numericValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMethod || !amount) return

    const numericAmount = parseFloat(amount)
    if (numericAmount < selectedMethod.minAmount || numericAmount > selectedMethod.maxAmount) {
      alert(`Please enter an amount between ${phpConfig.symbol}${selectedMethod.minAmount} and ${phpConfig.symbol}${selectedMethod.maxAmount}`)
      return
    }

    setIsLoading(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // For demo, we'll just show success
    alert(`Payment request created! Amount: ${config.symbol}${numericAmount}\n\nIn production, this would redirect to payment gateway.`)
    setIsLoading(false)
    setSelectedMethod(null)
    setAmount("")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
      
      <div className="p-6 md:p-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-sans text-3xl md:text-4xl font-light text-slate-900 mb-2">
            Add <span className="italic text-rose-500 font-semibold">Funds</span>
          </h1>
          <p className="font-mono text-sm text-slate-500">Top up your account balance</p>
        </motion.div>

        {/* Current Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-rose-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-rose-100 uppercase mb-1">Current Balance</p>
              <p className="font-sans text-4xl font-bold">{formatPrice(parseFloat(user.balance || '0'))}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet size={32} className="text-white" />
            </div>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="font-mono text-sm text-slate-500 uppercase tracking-wider mb-4">Select Payment Method</h2>
          
          {!selectedMethod ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method)}
                    className="bg-white p-6 rounded-2xl border border-rose-100 hover:border-rose-300 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-500 transition-colors">
                      <Icon size={24} className="text-rose-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-mono text-base font-semibold text-slate-900 mb-1">{method.name}</h3>
                    <p className="font-mono text-xs text-slate-500 mb-2">{method.description}</p>
                    <p className="font-mono text-[10px] text-slate-400">
                      Min: {phpConfig.symbol}{method.minAmount.toLocaleString()} | Max: {phpConfig.symbol}{method.maxAmount.toLocaleString()}
                    </p>
                  </button>
                )
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-rose-100 p-6"
            >
              <button
                onClick={() => setSelectedMethod(null)}
                className="text-sm text-rose-500 hover:text-rose-600 mb-4 font-mono"
              >
                ← Back to payment methods
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  {(() => {
                    const Icon = selectedMethod.icon
                    return <Icon size={24} className="text-rose-500" />
                  })()}
                </div>
                <div>
                  <h3 className="font-mono text-lg font-semibold text-slate-900">{selectedMethod.name}</h3>
                  <p className="font-mono text-xs text-slate-500">{selectedMethod.description}</p>
                </div>
              </div>

              {/* Amount Input */}
              <form onSubmit={handleSubmit} className="mb-6">
                <label className="font-mono text-xs text-slate-500 uppercase block mb-2">
                  Amount (Min: {phpConfig.symbol}{selectedMethod.minAmount.toLocaleString()} - Max: {phpConfig.symbol}{selectedMethod.maxAmount.toLocaleString()})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg text-slate-400">{config.symbol}</span>
                  <input
                    type="text"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-rose-100 rounded-xl font-mono text-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2 mt-3">
                  {[100, 500, 1000, 5000].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 rounded-lg font-mono text-sm text-rose-600 transition-colors"
                    >
                      {config.symbol}{quickAmount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !amount}
                  className="w-full mt-4 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white py-4 rounded-xl font-mono font-semibold transition-all hover:shadow-lg hover:shadow-rose-500/30 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Instructions */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-mono text-xs text-slate-500 uppercase mb-3">How to pay:</h4>
                <ol className="space-y-2">
                  {selectedMethod.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="w-5 h-5 bg-rose-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-mono text-rose-600">
                        {index + 1}
                      </span>
                      <span className="font-mono text-sm text-slate-600">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Demo Notice */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="font-mono text-xs text-yellow-700">
                  ⚠️ Demo Mode: No real payment will be processed. This is for demonstration purposes.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-rose-100 p-6"
        >
          <h2 className="font-mono text-sm text-slate-500 uppercase tracking-wider mb-4">Recent Transactions</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="font-mono text-sm text-slate-500">No recent transactions</p>
              <p className="font-mono text-xs text-slate-400">Your deposit history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <div>
                      <p className="font-mono text-sm font-semibold text-slate-900">{config.symbol} {tx.amount.toLocaleString()}</p>
                      <p className="font-mono text-xs text-slate-500">{tx.method}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-green-600">Completed</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-center justify-center gap-2 text-slate-400"
        >
          <Shield size={16} />
          <p className="font-mono text-xs">Secure payment processing. Your data is encrypted.</p>
        </motion.div>
      </div>
    </div>
  )
}
