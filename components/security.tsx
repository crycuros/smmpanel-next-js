"use client"

import { useEffect, useState, useCallback } from "react"

interface MenuPosition {
  x: number
  y: number
}

export function Security() {
  const [devToolsOpen, setDevToolsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  // Handle custom right-click menu
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault()
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }, [])

  // Hide menu on click
  const handleClick = useCallback(() => {
    setShowMenu(false)
  }, [])

  // Handle menu actions
  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case "reload":
        window.location.reload()
        break
      case "copy":
        try {
          const text = window.getSelection()?.toString() || ""
          navigator.clipboard.writeText(text)
        } catch (err) {
          console.log("Copy failed")
        }
        break
      case "search":
        const selection = window.getSelection()?.toString()
        if (selection) {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(selection)}`, "_blank")
        }
        break
      case "inspect":
        // Don't allow inspecting elements
        break
    }
    setShowMenu(false)
  }, [])

  useEffect(() => {
    // Disable right-click context menu (we'll show custom menu instead)
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Disable keyboard shortcuts for developer tools
    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault()
      }
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault()
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault()
      }
      // Ctrl+Shift+C (Inspector)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault()
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault()
      }
      // Ctrl+S (Save)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
      }
      // Ctrl+P (Print)
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault()
      }
      // Ctrl+H (History)
      if (e.ctrlKey && e.key === "h") {
        e.preventDefault()
      }
    }

    // Detect DevTools opening
    const detectDevTools = () => {
      const threshold = 160
      const checkDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold
        const heightThreshold = window.outerHeight - window.innerHeight > threshold
        
        if (widthThreshold || heightThreshold) {
          if (!devToolsOpen) {
            setDevToolsOpen(true)
            console.warn("Developer tools detected!")
          }
        } else {
          setDevToolsOpen(false)
        }
      }

      setInterval(checkDevTools, 500)
    }

    // Block console methods in production
    if (process.env.NODE_ENV === "production") {
      const originalConsole = { ...console }
      
      // Override console.log, console.warn, console.error for production
      console.log = (...args) => {
        // Allow critical errors only
        if (args[0]?.toString().includes("error") || args[0]?.toString().includes("Error")) {
          originalConsole.error(...args)
        }
        // Silently block other console output
      }
      
      console.warn = () => {}
      console.info = () => {}
      
      // Attempt to block debugger in production
      try {
        // @ts-ignore
        window.debugger = function() {}
        // @ts-ignore
        delete window.debugger
      } catch (e) {
        // Ignore errors
      }
    }

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("click", handleClick)
    document.addEventListener("keydown", disableKeyboardShortcuts)
    
    // Start DevTools detection
    detectDevTools()

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("click", handleClick)
      document.removeEventListener("keydown", disableKeyboardShortcuts)
    }
  }, [devToolsOpen, handleContextMenu, handleClick])

  // Block page visibility change (prevent being run in background frames)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - could be in an iframe
        document.title = "Paused"
      } else {
        document.title = "SMM Panel"
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  // Custom Context Menu - Smaller and no emojis
  return (
    <>
      {showMenu && menuPosition && (
        <div
          className="fixed z-[999999] min-w-[160px] bg-white/98 backdrop-blur-xl rounded-lg border border-rose-200 shadow-xl shadow-rose-500/20 overflow-hidden"
          style={{ 
            left: Math.min(menuPosition.x, window.innerWidth - 180), 
            top: Math.min(menuPosition.y, window.innerHeight - 250)
          }}
        >
          {/* Header */}
          <div className="px-3 py-2 bg-rose-500">
            <p className="font-mono text-[10px] text-white/80">MND Panel</p>
          </div>
          
          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleMenuAction("reload")}
              className="w-full px-3 py-1.5 flex items-center justify-between text-left text-slate-700 hover:bg-rose-50 transition-all font-mono text-xs"
            >
              <span>Reload</span>
              <span className="text-[9px] text-slate-400">F5</span>
            </button>
            
            <button
              onClick={() => handleMenuAction("copy")}
              className="w-full px-3 py-1.5 flex items-center justify-between text-left text-slate-700 hover:bg-rose-50 transition-all font-mono text-xs"
            >
              <span>Copy</span>
              <span className="text-[9px] text-slate-400">Ctrl+C</span>
            </button>
            
            <button
              onClick={() => handleMenuAction("search")}
              className="w-full px-3 py-1.5 flex items-center justify-between text-left text-slate-700 hover:bg-rose-50 transition-all font-mono text-xs"
            >
              <span>Search</span>
            </button>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-rose-100 mx-2" />
          
          {/* Protected Items - Greyed out */}
          <div className="py-1 bg-slate-50">
            <div className="px-3 py-1.5 flex items-center justify-between text-slate-300 font-mono text-xs cursor-not-allowed">
              <span>Inspect</span>
              <span className="text-[9px]">F12</span>
            </div>
            
            <div className="px-3 py-1.5 flex items-center justify-between text-slate-300 font-mono text-xs cursor-not-allowed">
              <span>View Source</span>
            </div>
          </div>
        </div>
      )}
      
      {/* DevTools Warning Overlay */}
      {devToolsOpen && (
        <div className="fixed inset-0 z-[999998] bg-rose-500/10 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-2xl border border-rose-200 max-w-sm">
            <div className="text-center">
              <h2 className="font-mono text-sm font-bold text-slate-900 mb-2">
                Developer Tools Detected
              </h2>
              <p className="font-mono text-xs text-slate-600 mb-4">
                Please close developer tools to continue.
              </p>
              <button
                onClick={() => setDevToolsOpen(false)}
                className="px-4 py-1.5 bg-rose-500 text-white rounded-lg font-mono text-xs font-semibold hover:bg-rose-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
