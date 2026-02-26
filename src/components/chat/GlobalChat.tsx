"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, MessageSquare, X, Crown, Zap, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWebSocket } from "@/hooks/useWebSocket"

interface Message {
  id: string
  message: string
  isSystem: boolean
  createdAt: string
  user: {
    name: string | null
    image: string | null
    vipLevel: string
    role: string
  }
}

export default function GlobalChat() {
  const { socket, connected } = useWebSocket()
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isOpen, setIsOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return

    const handleMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg].slice(-100)) // Keep last 100
    }

    socket.on('chat:message', handleMessage)

    return () => {
      socket.off('chat:message', handleMessage)
    }
  }, [socket])

  // Load initial history (optional, or rely on socket for now)
  useEffect(() => {
    if (!isOpen) return
    // You could fetch last 50 messages from DB here if via API
  }, [isOpen])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !session || !socket) return

    const messageContent = inputText.trim()
    setInputText("")

    // Emit to socket
    socket.emit('chat:send', { 
      message: messageContent,
      roomId: 'global' // Default room
    })
  }

  const getVIPColor = (level: string) => {
    switch(level?.toUpperCase()) {
      case 'PLATINUM': return 'from-cyan-400 to-blue-400'
      case 'GOLD': return 'from-yellow-400 to-orange-400'
      case 'SILVER': return 'from-gray-300 to-gray-400'
      case 'DIAMOND': return 'from-purple-400 to-pink-400'
      default: return 'from-green-400 to-emerald-400'
    }
  }

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button 
          variant="default" 
          size="icon" 
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-[0_0_40px_rgba(251,191,36,0.3)] z-50 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 border border-primary/30"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-black" />
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-6 right-6 w-96 h-[600px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="relative p-4 bg-gradient-to-r from-primary/10 to-orange-500/10 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-orange-500/5 animate-pulse-slow" />
        <div className="relative flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Users className="w-6 h-6 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 animate-pulse border-2 border-black" />
            </div>
            <div>
              <h3 className="font-bold text-white font-heading">Global Chat</h3>
              <p className="text-xs text-gray-400">{messages.length} messages</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  "flex gap-3 p-3 rounded-xl transition-all hover:bg-white/5",
                  msg.isSystem && "bg-primary/5 border border-primary/20"
                )}
              >
                <Avatar className="h-8 w-8 ring-2 ring-white/10">
                  <AvatarImage src={msg.user.image || undefined} />
                  <AvatarFallback className={cn(
                    "text-xs font-bold",
                    msg.user.role === 'ADMIN' ? "bg-gradient-to-br from-red-500 to-pink-500" : "bg-gradient-to-br " + getVIPColor(msg.user.vipLevel)
                  )}>
                    {msg.user.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={cn(
                      "text-xs font-bold",
                      msg.user.role === 'ADMIN' ? "text-red-400" : "text-white"
                    )}>
                      {msg.user.name || 'User'}
                    </span>
                    {msg.user.role === 'ADMIN' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        ADMIN
                      </span>
                    )}
                    {msg.user.vipLevel !== 'BRONZE' && msg.user.role !== 'ADMIN' && (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-md font-bold text-white flex items-center gap-1 bg-gradient-to-r",
                        getVIPColor(msg.user.vipLevel)
                      )}>
                        <Zap className="w-3 h-3" />
                        {msg.user.vipLevel}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 break-words leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      {session ? (
        <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary/50 focus-visible:border-primary/50 pr-10"
                disabled={!connected}
                maxLength={500}
              />
              {inputText && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  {inputText.length}/500
                </span>
              )}
            </div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                type="submit" 
                size="icon" 
                className="h-10 w-10 shrink-0 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 border border-primary/30 shadow-[0_0_20px_rgba(251,191,36,0.2)]" 
                disabled={!connected || !inputText.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Be respectful • No spam • Follow rules
          </p>
        </form>
      ) : (
        <div className="p-4 bg-black/40 border-t border-white/10">
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-medium">Login to join the chat</p>
            <p className="text-xs text-gray-500 mt-1">Connect with other players</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
