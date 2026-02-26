'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, TrendingUp, Zap } from 'lucide-react'

import { BetResult } from '@/types'

export default function CoinFlipGame() {
  const [wager, setWager] = useState(10)
  const [choice, setChoice] = useState<'HEADS' | 'TAILS'>('HEADS')
  const [flipping, setFlipping] = useState(false)
  const [result, setResult] = useState<BetResult | null>(null)

  const flipCoin = async () => {
    setFlipping(true)
    setResult(null)

    try {
      const res = await fetch('/api/bets/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: 'COINFLIP',
          wager,
          gameConfig: { choice },
        }),
      })

      const data = await res.json()
      
      if (data.success) {
        // Simulate flip animation
        setTimeout(() => {
          setResult(data.result)
          setFlipping(false)
        }, 1500)
      } else {
        alert(data.error || 'Bet failed')
        setFlipping(false)
      }
    } catch (error) {
      console.error('Coinflip error:', error)
      alert('Failed to place bet')
      setFlipping(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-gray-950 to-black p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] animate-pulse-slow" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Coins className="w-6 h-6 text-yellow-400 animate-pulse" />
            <span className="text-sm uppercase tracking-wider text-gray-500 font-bold">50/50 Chance</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-3 text-white font-heading tracking-tight">
            🪙 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-200 to-yellow-400 animate-text-shimmer bg-[length:200%_auto]">Coin Flip</span>
          </h1>
          <p className="text-gray-400 text-lg">Heads or Tails? Make your choice and flip!</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-8">
              {/* Coin Display */}
              <div className="flex items-center justify-center mb-8 h-60">
                <AnimatePresence mode="wait">
                  {flipping ? (
                    <motion.div
                      key="flipping"
                      animate={{ rotateY: [0, 1800] }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-6xl font-bold shadow-[0_0_80px_rgba(250,204,21,0.6)] border-8 border-white/20"
                    >
                      ?
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className={`w-48 h-48 rounded-full flex items-center justify-center text-6xl font-bold shadow-[0_0_80px_rgba(250,204,21,0.6)] border-8 border-white/20 ${
                        result.result.flip === 'HEADS'
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                          : 'bg-gradient-to-br from-gray-400 to-gray-600'
                      }`}
                    >
                      {result.result.flip === 'HEADS' ? '👑' : '⚔️'}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      animate={{ rotateY: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="w-48 h-48 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-6xl shadow-[0_0_60px_rgba(75,85,99,0.4)] border-8 border-white/10"
                    >
                      🪙
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-center p-6 rounded-2xl mb-6 border-2 ${
                    result.isWin 
                      ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]' 
                      : 'bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                  }`}
                >
                  <p className="text-4xl font-bold mb-3 font-heading">
                    {result.isWin ? '🎉 YOU WON!' : '😢 YOU LOST'}
                  </p>
                  <p className={`text-3xl font-bold font-heading ${result.isWin ? 'text-green-400' : 'text-red-400'}`}>
                    {result.isWin ? '+' : '-'}₹{result.isWin ? result.payout.toFixed(2) : result.wager.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 mt-3">
                    Result: <span className="text-white font-bold">{result.result.flip as string}</span> 
                    (You chose <span className="text-white font-bold">{result.result.choice as string}</span>)
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
                    max="10000"
                    className="w-full px-5 py-4 rounded-xl bg-black/60 border border-white/10 text-white text-2xl font-bold font-heading focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>

                {/* Choice */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setChoice('HEADS')}
                    className={`py-8 rounded-2xl font-bold text-2xl transition-all hover:scale-105 ${
                      choice === 'HEADS'
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-[0_0_40px_rgba(234,179,8,0.4)] border-2 border-yellow-300/50'
                        : 'bg-black/60 text-gray-400 hover:bg-black/80 border-2 border-white/10'
                    }`}
                  >
                    <div className="text-5xl mb-2">👑</div>
                    HEADS
                  </button>
                  <button
                    onClick={() => setChoice('TAILS')}
                    className={`py-8 rounded-2xl font-bold text-2xl transition-all hover:scale-105 ${
                      choice === 'TAILS'
                        ? 'bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-[0_0_40px_rgba(107,114,128,0.4)] border-2 border-gray-300/50'
                        : 'bg-black/60 text-gray-400 hover:bg-black/80 border-2 border-white/10'
                    }`}
                  >
                    <div className="text-5xl mb-2">⚔️</div>
                    TAILS
                  </button>
                </div>

                {/* Flip Button */}
                <button
                  onClick={flipCoin}
                  disabled={flipping}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-5 text-xl font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:scale-[1.02]"
                >
                  {flipping ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                      Flipping...
                    </span>
                  ) : (
                    '🪙 Flip Coin'
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
                <h3 className="font-bold text-white font-heading text-lg">Win Chance</h3>
              </div>
              <p className="text-4xl font-bold text-green-400 font-heading">50%</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white font-heading text-lg">Multiplier</h3>
              </div>
              <p className="text-4xl font-bold text-yellow-400 font-heading">1.98x</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 font-heading text-lg">🔒 Provably Fair</h3>
              {result ? (
                <div className="text-xs text-gray-400 space-y-2 font-mono">
                  <div className="p-2 bg-black/40 rounded-lg">
                    <p className="text-gray-500 mb-1">Nonce</p>
                    <p>{result.nonce}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Place a bet to see verification data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
