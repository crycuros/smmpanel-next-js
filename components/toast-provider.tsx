"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "warning" | "info"
  title?: string
  addedAt: number
}

interface ToastContextType {
  addToast: (message: string, type: "success" | "error" | "warning" | "info", duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const toastIcons = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
  ),
}

const toastColors = {
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
}

function SileoToast({ toast, onClose, onExtendDuration }: { 
  toast: Toast; 
  onClose: () => void;
  onExtendDuration: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    onExtendDuration()
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    onExtendDuration()
  }

  return (
    <motion.button
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        y: 0,
        width: isHovered ? 48 : 320,
        height: isHovered ? 48 : 90,
      }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      transition={{ 
        type: "spring", 
        stiffness: 350, 
        damping: 28,
        mass: 0.8
      }}
      className="relative overflow-hidden rounded-full cursor-pointer border-0 p-0 bg-transparent text-left flex items-center justify-center"
      onClick={onClose}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        filter: isHovered ? "url(#sileo-gooey-compact)" : "url(#sileo-gooey-expand)",
      }}
    >
      {/* SVG Gooey Filters */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="sileo-gooey-expand" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -12" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
          <filter id="sileo-gooey-compact" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -15" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background */}
      <motion.div 
        className="absolute inset-0 rounded-full"
        animate={{ 
          background: isHovered ? toastColors[toast.type] : "#1a1a1a",
          borderRadius: 24,
        }}
        transition={{ duration: 0.25 }}
      />

      {/* Expanded Content */}
      <AnimatePresence>
        {!isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center px-4 gap-3"
          >
            {/* Animated Blobs */}
            <motion.div
              initial={{ scale: 0, x: -30 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="absolute left-2 w-6 h-6 rounded-full"
              style={{ 
                background: toastColors[toast.type],
                filter: "blur(6px)",
              }}
            />
            
            {/* Icon */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
              style={{ 
                background: `${toastColors[toast.type]}30`,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ color: toastColors[toast.type] }}
              >
                {toastIcons[toast.type]}
              </motion.div>
            </div>

            {/* Message */}
            <p className="text-white text-sm font-medium truncate z-10">
              {toast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Icon (shown on hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ color: "white" }}
            >
              {toastIcons[toast.type]}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "warning" | "info"; title?: string; addedAt: number }[]>([])

  // Auto-remove toasts after 6 seconds of inactivity
  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((prev) => {
        const now = Date.now()
        return prev.filter((t) => now - t.addedAt < 6000)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const addToast = useCallback((message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = `toast-${type}-${message.substring(0, 20)}`
    
    setToasts((prev) => {
      const existingToast = prev.find(t => t.id === id)
      if (existingToast) {
        return prev.map(t => t.id === id ? { ...t, addedAt: Date.now() } : t)
      }
      return [...prev, { id, message, type, addedAt: Date.now() }]
    })
  }, [])

  const extendDuration = useCallback((id: string) => {
    setToasts((prev) => 
      prev.map(t => t.id === id ? { ...t, addedAt: Date.now() } : t)
    )
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <SileoToast 
              key={toast.id} 
              toast={toast} 
              onClose={() => removeToast(toast.id)}
              onExtendDuration={() => extendDuration(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
