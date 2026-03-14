"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Mail, Lock, ArrowRight, Chrome } from "lucide-react"
import { CustomCursor } from "@/components/custom-cursor"
import { useToast } from "@/components/toast-provider"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        addToast(`Welcome back, ${data.user?.name || 'User'}!`, "success", 2000)
        // Store user data in localStorage or session
        localStorage.setItem('user', JSON.stringify(data.user))
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      } else {
        addToast(data.error || 'Login failed', "error", 3000)
        setIsLoading(false)
      }
    } catch (error) {
      addToast('An error occurred. Please try again.', "error", 3000)
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    // Redirect to Supabase Google OAuth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const redirectTo = `${window.location.origin}/api/auth/callback/google`
    
    // For now, show message that Google OAuth needs to be configured
    addToast("Google OAuth requires Supabase configuration. Contact admin.", "info", 5000)
  }

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
          <h1 className="font-sans text-4xl font-light text-slate-900 mb-2">Welcome Back</h1>
          <p className="font-sans text-slate-600">Sign in to your MND account to continue growing</p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-8 border border-rose-200 bg-white"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block font-mono text-xs tracking-wider text-slate-600 mb-3">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 focus:border-rose-500 focus:outline-none transition-colors duration-300 font-sans text-slate-900 cursor-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block font-mono text-xs tracking-wider text-slate-600">
                  PASSWORD
                </label>
                <Link href="#" className="font-mono text-xs text-rose-600 hover:text-rose-700">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 focus:border-rose-500 focus:outline-none transition-colors duration-300 font-sans text-slate-900 cursor-none"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-rose-300 cursor-none"
              />
              <label htmlFor="remember" className="font-mono text-xs text-slate-600">
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-75 cursor-none"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-rose-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-600">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className="py-2 border border-slate-300 font-semibold text-slate-900 hover:border-rose-500 hover:bg-rose-50 transition-colors duration-300 flex items-center justify-center gap-2 cursor-none"
            >
              <Chrome className="w-5 h-5" />
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

        {/* Sign Up Link */}
        <p className="text-center mt-8 font-sans text-slate-600">
          Don't have an account?{" "}
          <Link href="/signup" className="text-rose-600 font-semibold hover:text-rose-700">
            Sign up here
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
