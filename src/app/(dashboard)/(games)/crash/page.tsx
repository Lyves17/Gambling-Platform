'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, TrendingUp } from 'lucide-react'

import { BetResult } from '@/types'

export default function CrashGame() {
  const [wager, setWager] = useState(10)
  const [cashoutAt, setCashoutAt] = useState(2.0)
  const [playing, setPlaying] = useState(false)
  const [crashed, setCrashed] = useState(false)
  const [multiplier, setMultiplier] = useState(1.0)
  const [result, setResult] = useState<BetResult | null>(null)

  const playRound = async () => {
    setPlaying(true)
    setCrashed(false)
    setResult(null)
    setMultiplier(1.0)

    try {
      const res = await fetch('/api/bets/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: 'CRASH',
          wager,
          gameConfig: { cashoutAt },
        }),
      })

      const data = await res.json()
      
      if (data.success) {
        // Animate multiplier to crash point
        const crashPoint = data.result.result.crashPoint
        const animateToPoint = Math.min(cashoutAt * 1.2, crashPoint)
        
        const duration = 2000 // 2 seconds
        const steps = 60
        const stepDuration = duration / steps

        for (let i = 1; i <= steps; i++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration))
          const currentMult = 1.0 + (animateToPoint - 1.0) * (i / steps)
          setMultiplier(currentMult)
          
          if (currentMult >= crashPoint) {
            setCrashed(true)
            setResult(data.result)
            setPlaying(false)
            break
          }
          
          if (currentMult >= cashoutAt && !crashed) {
            setResult(data.result)
            setPlaying(false)
            break
          }
        }
      } else {
        alert(data.error || 'Bet failed')
        setPlaying(false)
      }
    } catch (error) {
      console.error('Crash error:', error)
      alert('Failed to place bet')
      setPlaying(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Compact Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black via-gray-950 to-black p-5"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] animate-pulse-slow" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-orange-400 animate-pulse" />
                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">High Risk • High Reward</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white font-heading tracking-tight">
                🚀 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-200 to-orange-400 animate-text-shimmer bg-[length:200%_auto]">Crash</span>
              </h1>
              <p className="text-gray-400 text-sm">Cash out before it crashes!</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Game Area */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
              {/* Compact Multiplier Display */}
              <div className="text-center mb-4">
                <motion.div
                  animate={{ scale: playing ? [1, 1.05, 1] : 1 }}
                  transition={{ repeat: playing ? Infinity : 0, duration: 0.5 }}
                  className={`text-6xl md:text-7xl font-bold font-heading mb-2 ${
                    crashed ? 'text-red-500' : multiplier >= cashoutAt ? 'text-green-400' : 'text-white'
                  }`}
                >
                  {multiplier.toFixed(2)}x
                </motion.div>
                <p className={`text-base font-medium ${
                  crashed ? 'text-red-400' : playing ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {playing ? (crashed ? '💥 CRASHED!' : '🚀 Flying...') : 'Ready'}
                </p>
              </div>

              {/* Enhanced Graph with Rocket */}
              <div className="h-48 bg-gradient-to-br from-black/80 to-gray-900/60 rounded-2xl mb-4 relative overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(249,115,22,0.15)]">
                {/* Grid Background */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Main Graph */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={crashed ? "#ef4444" : "#f97316"} />
                      <stop offset="50%" stopColor={crashed ? "#dc2626" : "#fb923c"} />
                      <stop offset="100%" stopColor={crashed ? "#b91c1c" : "#fdba74"} />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={crashed ? "rgba(239,68,68,0.3)" : "rgba(249,115,22,0.3)"} />
                      <stop offset="100%" stopColor={crashed ? "rgba(239,68,68,0)" : "rgba(249,115,22,0)"} />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Area under curve */}
                  <motion.path
                    d={`M 0 256 L 0 ${256 - multiplier * 60} Q ${multiplier * 80} ${256 - multiplier * 80} ${Math.min(multiplier * 120, 800)} ${256 - multiplier * 90} L ${Math.min(multiplier * 120, 800)} 256 Z`}
                    fill="url(#areaGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: playing ? 0.6 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Main curve line */}
                  <motion.path
                    d={`M 0 ${256 - multiplier * 60} Q ${multiplier * 80} ${256 - multiplier * 80} ${Math.min(multiplier * 120, 800)} ${256 - multiplier * 90}`}
                    stroke="url(#lineGradient)"
                    strokeWidth="5"
                    fill="none"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: playing ? 1 : 0, opacity: playing ? 1 : 0.3 }}
                    transition={{ pathLength: { duration: 2, ease: "easeOut" }, opacity: { duration: 0.3 } }}
                  />
                </svg>

                {/* Animated Rocket */}
                {playing && (
                  <motion.div
                    className="absolute"
                    initial={{ left: 0, bottom: 0 }}
                    animate={{ 
                      left: `${Math.min(multiplier * 12, 80)}%`,
                      bottom: `${Math.min(multiplier * 9, 85)}%`
                    }}
                    transition={{ duration: 0.15, ease: "linear" }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: crashed ? 180 : [0, -5, 0, 5, 0],
                        scale: crashed ? 0.8 : 1
                      }}
                      transition={{ 
                        rotate: crashed ? { duration: 0.3 } : { duration: 2, repeat: Infinity },
                        scale: { duration: 0.2 }
                      }}
                    >
                      <Rocket className={`w-8 h-8 ${
                        crashed ? 'text-red-500' : 'text-orange-400'
                      } drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]`} />
                    </motion.div>
                  </motion.div>
                )}

                {/* Axis Labels */}
                <div className="absolute bottom-3 left-3 text-xs font-mono text-gray-400 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">1.00x</div>
                <div className="absolute top-3 right-3 text-sm font-mono font-bold text-orange-400 bg-black/50 px-3 py-1.5 rounded backdrop-blur-sm border border-orange-500/30">
                  {multiplier.toFixed(2)}x
                </div>
                
                {/* Target Line */}
                {!playing && cashoutAt > 1 && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-dashed border-yellow-400/40"
                    style={{ bottom: `${Math.min(cashoutAt * 9, 90)}%` }}
                  >
                    <span className="absolute right-3 -top-3 text-xs font-mono text-yellow-400 bg-black/70 px-2 py-0.5 rounded">
                      Target: {cashoutAt.toFixed(2)}x
                    </span>
                  </div>
                )}
              </div>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-center p-4 rounded-xl mb-4 border-2 ${
                    result.isWin 
                      ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]' 
                      : 'bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                  }`}
                >
                  <p className="text-2xl font-bold mb-2 font-heading">
                    {result.isWin ? `🎉 Cashed Out at ${cashoutAt}x!` : `💥 Crashed at ${(result.result.crashPoint as number).toFixed(2)}x`}
                  </p>
                  <p className={`text-2xl font-bold font-heading ${result.isWin ? 'text-green-400' : 'text-red-400'}`}>
                    {result.isWin ? '+' : '-'}₹{result.isWin ? result.payout.toFixed(2) : result.wager.toFixed(2)}
                  </p>
                </motion.div>
              )}

              {/* Controls */}
              <div className="space-y-6">
                {/* Wager */}
                <div>
                  <label className="block text-sm text-gray-300 mb-3 uppercase tracking-wider font-medium">Bet Amount (₹)</label>
                  <input
                    type="number"
                    value={wager}
                    onChange={(e) => setWager(Number(e.target.value))}
                    min="1"
                    max="5000"
                    disabled={playing}
                    className="w-full px-5 py-4 rounded-xl bg-black/60 border border-white/10 text-white text-2xl font-bold font-heading focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all disabled:opacity-50"
                  />
                </div>

                {/* Auto Cashout */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-gray-300 uppercase tracking-wider font-medium">Auto Cashout At</label>
                    <span className="text-2xl font-bold text-green-400 font-heading">{cashoutAt.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    value={cashoutAt}
                    onChange={(e) => setCashoutAt(Number(e.target.value))}
                    min="1.01"
                    max="100"
                    step="0.1"
                    disabled={playing}
                    className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1.01x</span>
                    <span>100x</span>
                  </div>
                </div>

                {/* Play Button */}
                <button
                  onClick={playRound}
                  disabled={playing}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-5 text-xl font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_40px_rgba(251,146,60,0.4)] hover:scale-[1.02]"
                >
                  {playing ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                      Flying...
                    </span>
                  ) : (
                    '🚀 Start Flight'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="font-bold text-white font-heading text-lg">Potential Win</h3>
              </div>
              <p className="text-4xl font-bold text-green-400 font-heading">₹{(wager * cashoutAt * 0.97).toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">3% house edge</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 font-heading text-lg">How to Play</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">✓</span>
                  Set your bet amount and auto-cashout multiplier
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">✓</span>
                  Watch the multiplier increase from 1.00x
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">✓</span>
                  Game automatically cashes out at your target or crashes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">✓</span>
                  If it crashes before your target, you lose your bet
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
