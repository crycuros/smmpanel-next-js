"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react"
import { CustomCursor } from "@/components/custom-cursor"
import { useToast } from "@/components/toast-provider"

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      router.push('/dashboard')
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        addToast('Account created successfully! Welcome to MND!', 'success', 2000)
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        // Redirect to dashboard
        setTimeout(() => router.push('/dashboard'), 1500)
      } else {
        addToast(data.error || 'Registration failed', 'error', 3000)
      }
    } catch (error) {
      addToast('Registration failed', 'error', 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const passwordMatch = formData.password === formData.confirmPassword && formData.password !== ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-rose-50 flex items-center justify-center px-4 py-20 cursor-none">
      <CustomCursor />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <span className="font-mono text-xl tracking-widest font-bold text-rose-600">MND</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </Link>
          <h1 className="font-sans text-4xl font-light text-slate-900 mb-2">Join MND Today</h1>
          <p className="font-sans text-slate-600">Start growing your social media presence now</p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-8 border border-rose-200 bg-white"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label className="block font-mono text-xs tracking-wider text-slate-600 mb-3">
                FULL NAME
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 focus:border-rose-500 focus:outline-none transition-colors duration-300 font-sans text-slate-900 cursor-none"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block font-mono text-xs tracking-wider text-slate-600 mb-3">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 focus:border-rose-500 focus:outline-none transition-colors duration-300 font-sans text-slate-900 cursor-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-mono text-xs tracking-wider text-slate-600 mb-3">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 focus:border-rose-500 focus:outline-none transition-colors duration-300 font-sans text-slate-900 cursor-none"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block font-mono text-xs tracking-wider text-slate-600 mb-3">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={`w-full pl-12 pr-4 py-3 border rounded-none focus:outline-none transition-colors duration-300 font-sans text-slate-900 cursor-none ${
                    formData.confirmPassword ? (passwordMatch ? "border-green-500" : "border-red-500") : "border-slate-300 focus:border-rose-500"
                  }`}
                />
                {formData.confirmPassword && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2">
                    {passwordMatch ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <span className="text-red-500 text-lg">✕</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 rounded border-rose-300 cursor-none mt-1"
              />
              <label htmlFor="terms" className="font-sans text-sm text-slate-600">
                I agree to the{" "}
                <Link href="#" className="text-rose-600 font-semibold hover:text-rose-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-rose-600 font-semibold hover:text-rose-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Sign Up Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-75 cursor-none"
            >
              {isLoading ? "Creating account..." : "Get Started Free"}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-rose-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-600">Or sign up with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2 border border-slate-300 font-semibold text-slate-900 hover:border-rose-500 hover:bg-rose-50 transition-colors duration-300 cursor-none"
            >
              Google
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2 border border-slate-300 font-semibold text-slate-900 hover:border-rose-500 hover:bg-rose-50 transition-colors duration-300 cursor-none"
            >
              GitHub
            </motion.button>
          </div>
        </motion.div>

        {/* Sign In Link */}
        <p className="text-center mt-8 font-sans text-slate-600">
          Already have an account?{" "}
          <Link href="/signin" className="text-rose-600 font-semibold hover:text-rose-700">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
