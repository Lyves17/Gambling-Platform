"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GAMES } from "@/lib/games"
import { GameCard } from "@/components/GameCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Flame, Sparkles, Trophy, Dice5, MonitorPlay, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  const categories = [
    { id: "All", label: "Lobby", icon: Zap },
    { id: "Originals", label: "Originals", icon: Flame },
    { id: "Slots", label: "Slots", icon: Sparkles },
    { id: "Live", label: "Live Casino", icon: MonitorPlay },
    { id: "Cards", label: "Table Games", icon: Dice5 },
  ]

  // Filter Logic
  const filteredGames = GAMES.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Map internal categories to tab IDs
    let categoryMatch = false
    if (activeCategory === "All") categoryMatch = true
    else if (activeCategory === "Originals" && ["Casual"].includes(game.category)) categoryMatch = true
    else if (activeCategory === "Slots" && game.category === "Casino" && game.title === "Slots") categoryMatch = true
    else if (activeCategory === "Live" && game.category === "Live") categoryMatch = true
    else if (activeCategory === "Cards" && ["Cards", "Casino"].includes(game.category)) categoryMatch = true
    
    // Fallback for demo purposes if categories don't perfectly align
    if (activeCategory !== "All" && !categoryMatch) {
       if (activeCategory === "Originals" && ["Plinko", "Mines", "Crash", "Dice Roll", "Coin Flip", "Limbo"].includes(game.title)) categoryMatch = true
       if (activeCategory === "Cards" && ["Blackjack", "Poker", "Baccarat", "Hi-Lo"].includes(game.title)) categoryMatch = true
       if (activeCategory === "Slots" && ["Slots", "Wheel", "Keno"].includes(game.title)) categoryMatch = true
    }

    return matchesSearch && categoryMatch
  })

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Hero Spotlight V2 - More Immersive */}
      <section className="relative min-h-[500px] flex items-center pt-24 pb-12 overflow-hidden">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background z-0" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay z-0" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow" />
        
        <div className="container relative z-10 px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="max-w-2xl space-y-8 text-center lg:text-left">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md"
                    >
                        <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold h-5 px-1.5 text-[10px] uppercase tracking-wider">
                            New Release
                        </Badge>
                        <span className="text-gray-300 text-sm font-medium">Plinko XY is now live!</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-bold font-heading text-white tracking-tighter leading-[0.9]"
                    >
                        LEVEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary animate-text-shimmer bg-[length:200%_auto]">UP</span><br />
                        YOUR GAME
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light"
                    >
                        Experience the next generation of crypto gambling. Instant payouts, 1000x multipliers, and provably fair mechanics.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                    >
                        <Button size="lg" className="h-14 px-8 text-lg rounded-2xl bg-white text-black hover:bg-gray-200 font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                            Play Now
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-2xl border-white/10 hover:bg-white/10 text-white backdrop-blur-sm transition-all hover:scale-105">
                            <Trophy className="mr-2 h-5 w-5 text-primary" />
                            Leaderboard
                        </Button>
                    </motion.div>
                </div>

                {/* Hero Visual */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="relative w-full max-w-[500px] aspect-square hidden lg:block"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-purple-500/20 to-transparent rounded-full blur-[60px] animate-pulse-slow" />
                    {/* Placeholder for a cool 3D chip or game asset - using CSS shapes for now if image fails */}
                    <div className="relative z-10 w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/10 shadow-2xl p-6 flex items-center justify-center overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
                        <div className="text-center space-y-4 relative z-20">
                            <Flame className="w-32 h-32 text-primary mx-auto drop-shadow-[0_0_30px_rgba(247,147,26,0.5)] animate-bounce-slow" />
                            <h3 className="text-3xl font-heading font-bold text-white">HOT GAME</h3>
                            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                                99.8% RTP
                            </div>
                        </div>
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Filter Dock */}
      <div className="sticky top-20 z-40 py-6 mb-8 backdrop-blur-xl border-y border-white/5 bg-black/40">
        <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Custom Floating Tabs */}
                <div className="flex p-1 bg-black/60 rounded-2xl border border-white/10 backdrop-blur-md overflow-x-auto max-w-full no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2",
                                activeCategory === cat.id ? "text-black shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {activeCategory === cat.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-white to-gray-200 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {cat.icon && <cat.icon className={cn("w-4 h-4", activeCategory === cat.id ? "text-black" : "text-current")} />}
                                {cat.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Glass Search Input */}
                <div className="relative w-full md:w-[320px] group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-black/60 border border-white/10 rounded-2xl flex items-center px-4 h-12 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                        <Search className="w-5 h-5 text-gray-500 mr-3" />
                        <input 
                            type="text"
                            placeholder="Search games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-white placeholder:text-gray-600 w-full font-medium"
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="container px-4 mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredGames.length > 0 ? (
                <motion.div 
                    layout
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {filteredGames.map((game) => (
                        <motion.div
                            layout
                            key={game.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <GameCard 
                                title={game.title}
                                description={game.description}
                                icon={game.icon}
                                href={game.href}
                                color={game.color}
                                gradient={game.gradient}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-32 text-center"
                >
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Search className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 font-heading">No Games Found</h3>
                    <p className="text-gray-500 max-w-md">
                        We couldn&apos;t find anything matching &quot;{searchQuery}&quot;. Try a different search term or category.
                    </p>
                    <Button 
                        variant="link" 
                        onClick={() => {setSearchQuery(""); setActiveCategory("All")}}
                        className="text-primary mt-4 font-bold"
                    >
                        Clear Filters
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  )
}
