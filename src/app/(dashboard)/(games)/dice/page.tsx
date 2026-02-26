'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dice6, TrendingUp, Zap } from 'lucide-react'

import { BetResult } from '@/types'

export default function DiceGame() {
  const [wager, setWager] = useState(10)
  const [target, setTarget] = useState(50)
  const [isOver, setIsOver] = useState(true)
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<BetResult | null>(null)

  const rollDice = async () => {
    setRolling(true)
    setResult(null)

    try {
      const res = await fetch('/api/bets/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: 'DICE',
          wager,
          gameConfig: { target, isOver },
        }),
      })

      const data = await res.json()
      
      if (data.success) {
        setResult(data.result)
      } else {
        alert(data.error || 'Bet failed')
      }
    } catch (error) {
      console.error('Dice error:', error)
      alert('Failed to place bet')
    } finally {
      setRolling(false)
    }
  }

  const winChance = isOver ? (100 - target) : target
  const multiplier = (98 / winChance).toFixed(2)

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black via-gray-950 to-black p-5"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] animate-pulse-slow" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Dice6 className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Classic Game</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white font-heading tracking-tight">
              🎲 <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-200 to-red-400 animate-text-shimmer bg-[length:200%_auto]">Dice</span>
            </h1>
            <p className="text-gray-400 text-sm">Roll. Predict. Win!</p>
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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
              {/* Dice Display */}
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={rolling ? { rotate: 360, scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: rolling ? Infinity : 0 }}
                  className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-6xl font-bold font-heading shadow-[0_0_40px_rgba(239,68,68,0.5)] border-4 border-white/20"
                >
                  {result ? (result.result.roll as number) : '?'}
                </motion.div>
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
                    {result.isWin ? '🎉 YOU WON!' : '😢 YOU LOST'}
                  </p>
                  <p className={`text-2xl font-bold font-heading ${result.isWin ? 'text-green-400' : 'text-red-400'}`}>
                    {result.isWin ? '+' : '-'}₹{result.isWin ? result.payout.toFixed(2) : result.wager.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Rolled: {result.result.roll as number} | Target: {isOver ? 'Over' : 'Under'} {target}
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

                {/* Target */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-gray-300 uppercase tracking-wider font-medium">Target Number</label>
                    <span className="text-2xl font-bold text-primary font-heading">{target}</span>
                  </div>
                  <input
                    type="range"
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    min="1"
                    max="99"
                    className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1</span>
                    <span>99</span>
                  </div>
                </div>

                {/* Over/Under */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOver(false)}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 ${
                      !isOver
                        ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-[0_0_30px_rgba(102,126,234,0.3)]'
                        : 'bg-black/60 text-gray-400 hover:bg-black/80 border border-white/10'
                    }`}
                  >
                    Under {target}
                  </button>
                  <button
                    onClick={() => setIsOver(true)}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 ${
                      isOver
                        ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-[0_0_30px_rgba(102,126,234,0.3)]'
                        : 'bg-black/60 text-gray-400 hover:bg-black/80 border border-white/10'
                    }`}
                  >
                    Over {target}
                  </button>
                </div>

                {/* Roll Button */}
                <button
                  onClick={rollDice}
                  disabled={rolling}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white py-5 text-xl font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:scale-[1.02]"
                >
                  {rolling ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                      Rolling...
                    </span>
                  ) : (
                    '🎲 Roll Dice'
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
              <p className="text-4xl font-bold text-green-400 font-heading">{winChance}%</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white font-heading text-lg">Multiplier</h3>
              </div>
              <p className="text-4xl font-bold text-yellow-400 font-heading">{multiplier}x</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 font-heading text-lg">🔒 Provably Fair</h3>
              {result ? (
                <div className="text-xs text-gray-400 space-y-2 font-mono">
                  <div className="p-2 bg-black/40 rounded-lg break-all">
                    <p className="text-gray-500 mb-1">Server Seed</p>
                    <p>{(result.serverSeed || '').substring(0, 24)}...</p>
                  </div>
                  <div className="p-2 bg-black/40 rounded-lg break-all">
                    <p className="text-gray-500 mb-1">Client Seed</p>
                    <p>{(result.clientSeed || '').substring(0, 24)}...</p>
                  </div>
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
