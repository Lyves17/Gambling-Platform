'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Circle, Zap } from 'lucide-react'

const ROULETTE_NUMBERS = [
  { num: 0, color: 'green' },
  { num: 32, color: 'red' }, { num: 15, color: 'black' }, { num: 19, color: 'red' },
  { num: 4, color: 'black' }, { num: 21, color: 'red' }, { num: 2, color: 'black' },
  { num: 25, color: 'red' }, { num: 17, color: 'black' }, { num: 34, color: 'red' },
  { num: 6, color: 'black' }, { num: 27, color: 'red' }, { num: 13, color: 'black' },
  { num: 36, color: 'red' }, { num: 11, color: 'black' }, { num: 30, color: 'red' },
  { num: 8, color: 'black' }, { num: 23, color: 'red' }, { num: 10, color: 'black' },
  { num: 5, color: 'red' }, { num: 24, color: 'black' }, { num: 16, color: 'red' },
  { num: 33, color: 'black' }, { num: 1, color: 'red' }, { num: 20, color: 'black' },
  { num: 14, color: 'red' }, { num: 31, color: 'black' }, { num: 9, color: 'red' },
  { num: 22, color: 'black' }, { num: 18, color: 'red' }, { num: 29, color: 'black' },
  { num: 7, color: 'red' }, { num: 28, color: 'black' }, { num: 12, color: 'red' },
  { num: 35, color: 'black' }, { num: 3, color: 'red' }, { num: 26, color: 'black' },
]

import { BetResult } from '@/types'

export default function RouletteGame() {
  const [wager, setWager] = useState(10)
  const [betType, setBetType] = useState<'number' | 'color'>('color')
  const [selectedNumber, setSelectedNumber] = useState(0)
  const [selectedColor, setSelectedColor] = useState<'red' | 'black'>('red')
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<BetResult | null>(null)
  const [rotation, setRotation] = useState(0)

  const spinWheel = async () => {
    setSpinning(true)
    setResult(null)

    try {
      const res = await fetch('/api/bets/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: 'ROULETTE',
          wager,
          gameConfig: {
            betType,
            ...(betType === 'number' ? { number: selectedNumber } : { color: selectedColor }),
          },
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Calculate rotation to land on result
        const resultNumber = data.result.result.number
        const spins = 5 + Math.random() * 3 // 5-8 full spins
        const targetRotation = spins * 360 + (resultNumber * (360 / 37))
        
        setRotation(rotation + targetRotation)
        
        setTimeout(() => {
          setResult(data.result)
          setSpinning(false)
        }, 3000)
      } else {
        alert(data.error || 'Bet failed')
        setSpinning(false)
      }
    } catch (error) {
      console.error('Roulette error:', error)
      alert('Failed to spin')
      setSpinning(false)
    }
  }

  const getMultiplier = () => {
    if (betType === 'number') return '35x'
    if (betType === 'color') return '2x'
    return '1x'
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-gray-950 to-black p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] animate-pulse-slow" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Circle className="w-6 h-6 text-green-400 animate-pulse" />
            <span className="text-sm uppercase tracking-wider text-gray-500 font-bold">European Style</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-3 text-white font-heading tracking-tight">
            🎡 <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-200 to-green-400 animate-text-shimmer bg-[length:200%_auto]">Roulette</span>
          </h1>
          <p className="text-gray-400 text-lg">Bet on colors or numbers. Spin and win!</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wheel Display */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-8">
              {/* Wheel */}
              <div className="relative mb-8">
                <div className="w-80 h-80 mx-auto relative">
                  <motion.div
                    animate={{ rotate: rotation }}
                    transition={{ duration: 3, ease: "easeOut" }}
                    className="w-full h-full rounded-full border-8 border-yellow-600 bg-gradient-to-br from-yellow-800 to-yellow-900 shadow-[0_0_80px_rgba(202,138,4,0.4)] relative overflow-hidden"
                  >
                    {ROULETTE_NUMBERS.map((item, i) => (
                      <div
                        key={i}
                        className={`absolute w-full h-full flex items-center justify-center text-white font-bold`}
                        style={{
                          transform: `rotate(${i * (360 / 37)}deg)`,
                        }}
                      >
                        <div className={`w-8 h-8 flex items-center justify-center text-xs rounded-sm ${
                          item.color === 'red' ? 'bg-red-600' :
                          item.color === 'black' ? 'bg-black' :
                          'bg-green-600'
                        }`}>
                          {item.num}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                  
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-white drop-shadow-lg"></div>
                  </div>

                  {/* Result Display */}
                  {result && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white shadow-2xl backdrop-blur-md border-4 border-white/20 ${
                        (result.result.color as string) === 'red' ? 'bg-red-600/90' :
                        (result.result.color as string) === 'black' ? 'bg-black/90' :
                        'bg-green-600/90'
                      }`}>
                        <p className="text-5xl font-bold font-heading">{result.result.number as number}</p>
                        <p className="text-sm uppercase tracking-wider">{result.result.color as string}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
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
                    Number <span className="text-white font-bold">{result.result.number as number}</span> ({result.result.color as string})
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
                    disabled={spinning}
                    className="w-full px-5 py-4 rounded-xl bg-black/60 border border-white/10 text-white text-2xl font-bold font-heading focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all disabled:opacity-50"
                  />
                </div>

                {/* Bet Type */}
                <div>
                  <label className="block text-sm text-gray-300 mb-3 uppercase tracking-wider font-medium">Bet Type</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBetType('color')}
                      disabled={spinning}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 ${
                        betType === 'color'
                          ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-[0_0_30px_rgba(102,126,234,0.3)]'
                          : 'bg-black/60 text-gray-400 hover:bg-black/80 border border-white/10'
                      } disabled:opacity-50`}
                    >
                      Color
                    </button>
                    <button
                      onClick={() => setBetType('number')}
                      disabled={spinning}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 ${
                        betType === 'number'
                          ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-[0_0_30px_rgba(102,126,234,0.3)]'
                          : 'bg-black/60 text-gray-400 hover:bg-black/80 border border-white/10'
                      } disabled:opacity-50`}
                    >
                      Number
                    </button>
                  </div>
                </div>

                {/* Color Selection */}
                {betType === 'color' && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 uppercase tracking-wider font-medium">Select Color</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSelectedColor('red')}
                        disabled={spinning}
                        className={`py-6 rounded-xl font-bold text-xl transition-all hover:scale-105 ${
                          selectedColor === 'red'
                            ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] border-2 border-red-300/50'
                            : 'bg-red-900/40 text-gray-400 hover:bg-red-900/60 border border-white/10'
                        } disabled:opacity-50`}
                      >
                        RED
                      </button>
                      <button
                        onClick={() => setSelectedColor('black')}
                        disabled={spinning}
                        className={`py-6 rounded-xl font-bold text-xl transition-all hover:scale-105 ${
                          selectedColor === 'black'
                            ? 'bg-black text-white border-2 border-white/50 shadow-[0_0_30px_rgba(0,0,0,0.6)]'
                            : 'bg-gray-900/40 text-gray-400 hover:bg-gray-900/60 border border-white/10'
                        } disabled:opacity-50`}
                      >
                        BLACK
                      </button>
                    </div>
                  </div>
                )}

                {/* Number Selection */}
                {betType === 'number' && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 uppercase tracking-wider font-medium">Select Number (0-36)</label>
                    <input
                      type="number"
                      value={selectedNumber}
                      onChange={(e) => setSelectedNumber(Number(e.target.value))}
                      min="0"
                      max="36"
                      disabled={spinning}
                      className="w-full px-5 py-4 rounded-xl bg-black/60 border border-white/10 text-white text-2xl font-bold font-heading focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 transition-all"
                    />
                  </div>
                )}

                {/* Spin Button */}
                <button
                  onClick={spinWheel}
                  disabled={spinning}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-5 text-xl font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-[1.02]"
                >
                  {spinning ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                      Spinning...
                    </span>
                  ) : (
                    '🎡 Spin Wheel'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white font-heading text-lg">Potential Payout</h3>
              </div>
              <p className="text-4xl font-bold text-yellow-400 font-heading">{getMultiplier()}</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 font-heading text-lg">How to Play</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  Bet on a specific number (35x payout)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  Or bet on a color (2x payout)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  Green (0) wins for number bet only
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
