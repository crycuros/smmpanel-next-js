"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Works", href: "#works" },
  { label: "How It Works", href: "#tutorial" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for logged in user
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    setIsMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : ""
        }`}
      >
        <nav className="flex items-center justify-between px-6 py-4 my-0 md:px-12 md:py-5">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className="group flex items-center gap-2"
          >
            <span className="font-mono text-xs tracking-widest font-bold text-rose-600">MND</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:scale-150 transition-transform duration-300" />
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <li key={link.label}>
                <button
                  onClick={() => scrollToSection(link.href)}
                  className="group relative font-mono text-xs tracking-wider text-slate-600 hover:text-rose-600 transition-colors duration-300"
                >
                  <span className="text-rose-500 mr-1">0{index + 1}</span>
                  {link.label.toUpperCase()}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-rose-500 group-hover:w-full transition-all duration-300" />
                </button>
              </li>
            ))}
          </ul>

          {/* Auth Buttons - Show user info if logged in */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {/* User Info */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-white">
                      {(user.name || user.username || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-mono text-xs font-semibold text-slate-900">
                      {user.name || user.username || 'User'}
                    </p>
                    <p className="font-mono text-[10px] text-rose-500">
                      {user.balance ? `₱${parseFloat(user.balance).toFixed(2)}` : '₱0.00'}
                    </p>
                  </div>
                </Link>
                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="font-mono text-xs tracking-wider text-slate-600 hover:text-rose-600 transition-colors duration-300"
                >
                  SIGN OUT
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="font-mono text-xs tracking-wider text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-blue-400 transition-colors duration-300 cursor-none"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-rose-500 dark:bg-blue-600 text-white font-mono text-xs tracking-wider rounded-lg hover:bg-rose-600 dark:hover:bg-blue-700 transition-colors duration-300 cursor-none"
                >
                  SIGN UP
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className="w-6 h-px bg-slate-900 dark:bg-slate-100 origin-center"
            />
            <motion.span
              animate={isMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              className="w-6 h-px bg-slate-900 dark:bg-slate-100"
            />
            <motion.span
              animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className="w-6 h-px bg-slate-900 dark:bg-slate-100 origin-center"
            />
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg md:hidden"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => scrollToSection(link.href)}
                  className="group text-4xl font-sans tracking-tight text-slate-900 dark:text-slate-100"
                >
                  <span className="text-rose-500 dark:text-blue-400 font-mono text-sm mr-2">0{index + 1}</span>
                  {link.label}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 mt-8"
              >
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-6 py-2 border-2 border-rose-500 text-rose-600 font-semibold rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="px-6 py-2 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-6 py-2 border-2 border-rose-500 dark:border-blue-400 text-rose-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-none"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-6 py-2 bg-rose-500 dark:bg-blue-600 text-white font-semibold rounded-lg hover:bg-rose-600 dark:hover:bg-blue-700 transition-colors cursor-none"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
