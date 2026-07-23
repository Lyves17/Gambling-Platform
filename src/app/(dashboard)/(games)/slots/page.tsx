'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cherry, Apple, Grape, Gem, Zap } from 'lucide-react'

const SYMBOLS = [
  { icon: Cherry, color: 'text-red-400', name:'cherry' },
  { icon: Apple, color: 'text-yellow-400', name: 'apple' },
  { icon: Grape, color: 'text-purple-400', name: 'grape' },
  { icon: Gem, color: 'text-pink-400', name: 'gem' },
  { icon: Zap, color: 'text-yellow-400', name: 'seven' },
]

interface SlotsResult {
  isWin: boolean
  wager: number
  payout: number
  multiplier: number
  reels: number[]
}

export default function SlotsGame() {
  const [wager, setWager] = useState(10)
  const [spinning, setSpinning] = useState(false)
  const [reels, setReels] = useState([0, 0, 0])
  const [result, setResult] = useState<SlotsResult | null>(null)

  const spinReels = async () => {
    setSpinning(true)
    setResult(null)

    try {
      const res = await fetch('/api/bets/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: 'SLOTS',
          wager,
        }),
      })
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Bet failed')
      }

      const serverReels: number[] = data.result.result.reels
      const serverMultiplier: number = data.result.multiplier
      const serverPayout: number = data.result.payout
      const serverIsWin: boolean = data.result.isWin

      // Animate through random reels, then land on server result
      const spinInterval = setInterval(() => {
        setReels([
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length),
        ])
      }, 50)

      setTimeout(() => {
        clearInterval(spinInterval)
        setReels(serverReels)

        setResult({
          isWin: serverIsWin,
          wager,
          payout: serverPayout,
          multiplier: serverMultiplier,
          reels: serverReels
        })

        setSpinning(false)
      }, 500)

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'An error occurred'
      alert(msg)
      setSpinning(false)
    }
  }

  const getSymbol = (num: number) => {
    const index = num % SYMBOLS.length
    return SYMBOLS[index]
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-gray-950 to-black p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px] animate-pulse-slow" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Cherry className="w-6 h-6 text-pink-400 animate-pulse" />
            <span className="text-sm uppercase tracking-wider text-gray-500 font-bold">Classic Slots</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-3 text-white font-heading tracking-tight">
            🎰 <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-200 to-pink-400 animate-text-shimmer bg-[length:200%_auto]">Slot Machine</span>
          </h1>
          <p className="text-gray-400 text-lg">Match the symbols and hit the jackpot!</p>
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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-8">
              {/* Slot Machine */}
              <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-3xl p-8 mb-6 shadow-[0_0_80px_rgba(202,138,4,0.4)]">
                <div className="flex justify-center gap-4 mb-6">
                  {reels.map((reel, i) => {
                    const Symbol = getSymbol(reel)
                    return (
                      <motion.div
                        key={i}
                        animate={spinning ? { y: [0, -30, 0] } : {}}
                        transition={{ repeat: spinning ? Infinity : 0, duration: 0.3, delay: i * 0.1 }}
                        className="w-36 h-36 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-yellow-700/50"
                      >
                        <Symbol.icon className={`w-24 h-24 ${Symbol.color}`} />
                      </motion.div>
                    )
                  })}
                </div>

                {/* Win Line */}
                <div className="h-2 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.6)]"></div>
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
                    {result.isWin ? '🎉 JACKPOT!' : '😢 No Match'}
                  </p>
                  <p className={`text-3xl font-bold font-heading ${result.isWin ? 'text-green-400' : 'text-red-400'}`}>
                    {result.isWin ? '+' : '-'}₹{result.isWin ? result.payout.toFixed(2) : result.wager.toFixed(2)}
                  </p>
                  {result.isWin && (
                    <p className="text-sm text-gray-400 mt-3">
                      {result.multiplier.toFixed(0)}x Multiplier!
                    </p>
                  )}
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
                    max="1000"
                    disabled={spinning}
                    className="w-full px-5 py-4 rounded-xl bg-black/60 border border-white/10 text-white text-2xl font-bold font-heading focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all disabled:opacity-50"
                  />
                </div>

                {/* Spin Button */}
                <button
                  onClick={spinReels}
                  disabled={spinning}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-5 text-xl font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:scale-[1.02]"
                >
                  {spinning ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                      Spinning...
                    </span>
                  ) : (
                    '🎰 Spin Reels'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Paytable Sidebar */}
        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 font-heading text-lg text-center">💰 Paytable</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <Grape className="w-5 h-5 text-purple-400" />
                    <Grape className="w-5 h-5 text-purple-400" />
                    <Grape className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="font-bold text-green-400 text-lg">50x</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2">
                    <Apple className="w-5 h-5 text-yellow-400" />
                    <Apple className="w-5 h-5 text-yellow-400" />
                    <Apple className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="font-bold text-green-400 text-lg">40x</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <Cherry className="w-5 h-5 text-red-400" />
                    <Cherry className="w-5 h-5 text-red-400" />
                    <Cherry className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="font-bold text-green-400 text-lg">30x</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-gray-300">Any 2 matching</span>
                  <span className="font-bold text-yellow-400 text-lg">2x</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 font-heading text-lg">How to Play</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">✓</span>
                  Set your bet amount
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">✓</span>
                  Spin the reels
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">✓</span>
                  Match 3 symbols for big wins
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">✓</span>
                  Match 2 symbols for small win
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
