"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, X, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: "user" | "bot"
  content: string
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! I am Diana. How can I help you today?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [size, setSize] = useState({ width: 400, height: 500 })
  const [isResizing, setIsResizing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null)
  const lastSentTime = useRef<number>(0)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUserId(user.client_id)
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isLoading])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeRef.current) return
      
      const deltaX = resizeRef.current.startX - e.clientX
      const deltaY = resizeRef.current.startY - e.clientY
      
      setSize({
        width: Math.max(320, Math.min(window.innerWidth - 48, resizeRef.current.startWidth + deltaX)),
        height: Math.max(400, Math.min(window.innerHeight - 48, resizeRef.current.startHeight + deltaY)),
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = 'nw-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing])

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    // Prevent rapid-fire requests (2s cooldown)
    const now = Date.now()
    if (now - lastSentTime.current < 2000) return
    lastSentTime.current = now

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          messages: messages.concat({ role: "user", content: userMessage }).map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content
          }))
        })
      })

      const data = await response.json()
      if (data.text) {
        setMessages(prev => [...prev, { role: "bot", content: data.text }])
      } else {
        setMessages(prev => [...prev, { role: "bot", content: "Sorry, an error occurred. Please try again." }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "bot", content: "Could not connect to the server. Please check your internet." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end">
      {isOpen ? (
        <Card 
          style={{ width: size.width, height: size.height }}
          className="flex flex-col shadow-2xl border-primary/20 bg-background/95 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 relative overflow-hidden"
        >
          <div 
            className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize z-50 flex items-center justify-center group/resize"
            onMouseDown={startResizing}
          >
            <div className="w-2 h-2 border-t-2 border-l-2 border-muted-foreground/30 group-hover/resize:border-primary transition-colors" />
          </div>

          <CardHeader className="p-4 border-b flex flex-row items-center justify-between bg-primary/5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Diana</h3>
                <p className="text-[10px] text-muted-foreground">Online | AI Assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 touch-none">
            <ScrollArea 
              className="h-full p-4" 
              ref={scrollRef}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                      m.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-muted/80 text-foreground rounded-tl-none border border-border/50"
                    }`}>
                      {m.role === "bot" ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                            a: ({href, children}) => (
                              <a 
                                href={href} 
                                className="text-primary font-bold underline hover:no-underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                            ul: ({children}) => <ul className="list-disc ml-4 space-y-1">{children}</ul>,
                            li: ({children}) => <li className="mb-1">{children}</li>
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      ) : (
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground rounded-2xl rounded-tl-none px-4 py-2 text-sm border border-border/50 animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t bg-background/50 shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex w-full gap-2"
            >
              <Input 
                placeholder="Type a message..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-background/50"
                disabled={isLoading}
              />
              <Button size="icon" type="submit" disabled={isLoading || !input.trim()} className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button 
          size="lg" 
          className="rounded-full w-20 h-20 shadow-2xl hover:scale-110 transition-all duration-300 bg-primary group flex flex-col items-center justify-center gap-1"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Chat</span>
        </Button>
      )}
    </div>
  )
}
