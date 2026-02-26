
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { 
  Menu, X, Wallet,
  Gamepad2, Home, Sparkles, Bell 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBalance } from '@/context/BalanceContext'

interface NavbarProps {
  variant?: 'public' | 'dashboard'
}

export function Navbar({ variant = 'public' }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session } = useSession()
  const { balance, isLoading } = useBalance() // Use global balance context
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (variant === 'dashboard') {
    return (
      <header className={cn(
        "sticky top-0 z-30 w-full transition-all duration-300",
        isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      )}>
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left Side (Breadcrumbs/Title - placeholder for now) */}
          <div className="flex items-center gap-4">
             {/* Mobile sidebar toggle is handled by Sidebar component, so we leave space or show nothing */}
             <div className="lg:hidden w-8" /> 
             <h2 className="text-lg font-semibold text-white/80 hidden md:block capitalize md:ml-0 ml-8">
                {pathname?.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
             </h2>
          </div>

          {/* Right Side (Actions) */}
          <div className="flex items-center gap-3">
             {/* Balance Pill */}
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group">
                <Wallet className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                <span className="font-mono font-bold text-emerald-400">
                  {isLoading ? '...' : `₹${balance.toFixed(2)}`}
                </span>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <span className="text-xs text-muted-foreground uppercase">INR</span>
             </div>

             {/* Notifications */}
             <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-black" />
             </button>

             {/* User Profile Dropdown Placeholder */}
             <Link href="/profile">
               <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-600 p-[2px] cursor-pointer hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-black overflow-hidden">
                    {session?.user?.image ? (
                        <Image src={session.user.image} alt="User" width={36} height={36} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white font-bold text-xs">
                            {session?.user?.name?.[0] || 'U'}
                        </div>
                    )}
                  </div>
               </div>
             </Link>
          </div>
        </div>
      </header>
    )
  }

  // PUBLIC VARIANT (Floating Island Design)
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl rounded-2xl border transition-all duration-300",
        isScrolled 
          ? "bg-black/80 backdrop-blur-xl border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] py-2" 
          : "bg-black/40 backdrop-blur-md border-white/5 py-3"
      )}
    >
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="px-4 md:px-6 flex items-center justify-between h-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-9 h-9 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl tracking-wider text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-200 transition-all">
            GAMBLEFI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/5">
          {[
            { name: 'Games', href: '/games', icon: Gamepad2 },
            { name: 'Features', href: '/#features', icon: Sparkles },
            { name: 'Live Stats', href: '/stats', icon: Home }, // Added for symmetry
          ].map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all relative group overflow-hidden"
            >
              <item.icon className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              <span className="relative z-10">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
             <Link href="/dashboard">
                <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-indigo-500/25">
                   Dashboard
                </Button>
             </Link>
          ) : (
            <>
              <Link href="/login">
                <span className="text-sm font-bold text-gray-300 hover:text-white transition-colors cursor-pointer px-4">
                  Log In
                </span>
              </Link>
              <Link href="/register">
                <Button className="rounded-xl bg-white text-black hover:bg-gray-100 font-bold border-0 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all transform hover:-translate-y-0.5">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="md:hidden border-t border-white/10 overflow-hidden bg-black/50 backdrop-blur-xl rounded-b-2xl mt-2"
          >
            <div className="p-4 space-y-2 flex flex-col">
              {[ 
                { name: 'Games', href: '/games', icon: Gamepad2 },
                { name: 'Features', href: '/#features', icon: Sparkles },
              ].map((item) => (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 text-indigo-400" />
                  {item.name}
                </Link>
              ))}
              
              <div className="h-px bg-white/10 my-2" />
              
              {session ? (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                   <Button className="w-full bg-indigo-600 rounded-xl">Go to Dashboard</Button>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl border-white/10 hover:bg-white/5">Log In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-xl font-bold">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
