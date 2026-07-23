'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bomb, Trophy, Coins, Play, Volume2, VolumeX } from 'lucide-react'
import { playSound } from '@/lib/sounds'

interface GameState {
  betId: string
  minePositions: number[]
  mineCount: number
}

interface CashoutResult {
  isWin: boolean
  payout: number
  multiplier: number
}

export default function MinesGame() {
  const [wager] = useState(10)
  const [mineCount, setMineCount] = useState(3)
  const [playing, setPlaying] = useState(false)
  const [revealed, setRevealed] = useState<number[]>([])
  const [result, setResult] = useState<CashoutResult | null>(null)
  const [minePositions, setMinePositions] = useState<number[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePlaySound = (type: 'click' | 'win' | 'lose' | 'pop' | 'coin') => {
    if (soundEnabled) playSound(type)
  }

  const startGame = async () => {
    handlePlaySound('click')
    setLoading(true)

    try {
      const res = await fetch('/api/games/mines/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mineCount }),
      })
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to start game')
      }

      setGameState({
        betId: data.betId,
        minePositions: data.minePositions,
        mineCount: data.mineCount,
      })
      setMinePositions(data.minePositions)
      setPlaying(true)
      setRevealed([])
      setResult(null)
      setGameOver(false)
      setCurrentMultiplier(1.00)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to start game'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  const revealTile = (position: number) => {
    if (!playing || revealed.includes(position) || gameOver) return

    const newRevealed = [...revealed, position]
    const hitMine = minePositions.includes(position)

    setRevealed(newRevealed)
    handlePlaySound('click')

    if (hitMine) {
      handlePlaySound('lose')
      setPlaying(false)
      setGameOver(true)
      setResult({
        isWin: false,
        payout: 0,
        multiplier: 0
      })
    } else {
      handlePlaySound('pop')
      const safeTiles = newRevealed.length
      const totalTiles = 25
      const mines = mineCount

      let multiplier = 1.00
      for (let i = 0; i < safeTiles; i++) {
        multiplier *= (totalTiles - i) / (totalTiles - mines - i)
      }
      multiplier *= 0.97

      setCurrentMultiplier(multiplier)
    }
  }

  const cashout = async () => {
    if (!playing || gameOver || revealed.length === 0 || !gameState) return

    handlePlaySound('win')
    setLoading(true)

    try {
      const res = await fetch('/api/games/mines/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betId: gameState.betId,
          revealed,
        }),
      })
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Cashout failed')
      }

      setMinePositions(gameState.minePositions)
      setPlaying(false)
      setGameOver(true)
      setResult({
        isWin: data.isWin,
        payout: data.payout,
        multiplier: data.multiplier,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Cashout failed'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  const displayMultiplier = currentMultiplier.toFixed(2)
  const potentialWin = (wager * currentMultiplier).toFixed(2)

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-gray-950 to-black p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse-slow" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Bomb className="w-6 h-6 text-red-400 animate-pulse" />
                <span className="text-sm uppercase tracking-wider text-gray-500 font-bold">High Stakes Game</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-3 text-white font-heading tracking-tight">
                💣 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-200 to-purple-400 animate-text-shimmer bg-[length:200%_auto]">Mines</span>
              </h1>
              <p className="text-gray-400 text-lg">Find the gems. Avoid the bombs. Cash out before it&apos;s too late!</p>
            </div>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10"
            >
              {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 md:p-8 relative overflow-hidden"
            >
               {/* Background Glow */}
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-orange-500/5 pointer-events-none" />

              <div className="grid grid-cols-5 gap-3 md:gap-4 mb-4 relative z-10">
                {Array.from({ length: 25 }).map((_, i) => {
                  const isRevealed = revealed.includes(i)
                  const isMine = minePositions.includes(i)
                  const isCurrentlyGameOver = gameOver || (!playing && result)

                  return (
                    <motion.button
                      key={i}
                      onClick={() => revealTile(i)}
                      disabled={!playing || isRevealed || gameOver}
                      whileHover={{ scale: playing && !isRevealed ? 1.05 : 1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={false}
                      animate={{
                         backgroundColor: isRevealed 
                            ? (isMine ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)')
                            : 'rgba(0, 0, 0, 0.4)',
                         borderColor: isRevealed
                            ? (isMine ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)')
                            : 'rgba(255, 255, 255, 0.1)'
                      }}
                      className={`aspect-square rounded-xl flex items-center justify-center text-3xl font-bold transition-all border-2 disabled:cursor-not-allowed`}
                    >
                      <AnimatePresence mode="wait">
                          {isRevealed && (
                             <motion.div
                                key={isMine ? 'mine' : 'gem'}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: 0.15 }}
                             >
                                {isMine ? (
                                    <Bomb className="w-8 h-8 md:w-10 md:h-10 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                ) : (
                                    <Trophy className="w-8 h-8 md:w-10 md:h-10 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                )}
                             </motion.div>
                          )}
                          {!isRevealed && isCurrentlyGameOver && isMine && (
                             <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.02 }}
                             >
                                 <Bomb className="w-6 h-6 text-white/20" />
                             </motion.div>
                          )}
                      </AnimatePresence>
                    </motion.button>
                  )
                })}
              </div>

              {/* Game Over / Win Overlay */}
              <AnimatePresence>
                {result && !playing && (
                   <motion.div
                     initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                     animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
                     exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                     className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-xl"
                   >
                     <motion.div
                         initial={{ scale: 0.5, y: 20 }}
                         animate={{ scale: 1, y: 0 }}
                         className={`p-8 rounded-2xl border-2 text-center shadow-2xl max-w-sm w-full mx-4 ${
                             result.isWin 
                                 ? 'bg-black/90 border-green-500 shadow-green-500/20' 
                                 : 'bg-black/90 border-red-500 shadow-red-500/20'
                         }`}
                     >
                         <div className="mb-4 flex justify-center">
                             {result.isWin ? (
                                 <div className="p-4 rounded-full bg-green-500/20">
                                     <Trophy className="w-12 h-12 text-green-400" />
                                 </div>
                             ) : (
                                 <div className="p-4 rounded-full bg-red-500/20">
                                     <Bomb className="w-12 h-12 text-red-500" />
                                 </div>
                             )}
                         </div>
                         <h2 className="text-3xl font-bold text-white mb-2">
                             {result.isWin ? 'Cashed Out!' : 'Busted!'}
                         </h2>
                         <div className="text-4xl font-mono font-bold mb-6 gradient-text">
                             {result.isWin ? `+₹${result.payout.toFixed(2)}` : `-₹${wager.toFixed(2)}`}
                         </div>
                         <button 
                             onClick={startGame}
                             disabled={loading}
                             className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                         >
                             <Play className="w-5 h-5" /> Play Again
                         </button>
                     </motion.div>
                   </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
             {/* Current Multiplier Display */}
              <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 text-center relative overflow-hidden border-primary/30"
                >
                  <div className="absolute inset-0 bg-gradient-primary opacity-5 pointer-events-none" />
                  <p className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Current Multiplier</p>
                  <motion.div 
                    key={displayMultiplier}
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.05 }}
                    transition={{ duration: 0.1 }}
                    className="text-5xl font-mono font-bold text-white mb-1 drop-shadow-lg"
                  >
                      {displayMultiplier}x
                  </motion.div>
                  <div className="text-xl text-green-400 font-mono">
                      ₹{potentialWin}
                  </div>
              </motion.div>

            {/* Bet Controls */}
            <div className="glass-card p-6 space-y-6">
              <div>
                <label className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Bet Amount</span>
                    <span className="text-xs text-gray-500">₹{wager.toFixed(2)}</span>
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <div className="w-full pl-8 pr-4 py-4 rounded-xl bg-black/40 border border-white/10 text-white text-lg font-mono">
                      {wager}
                    </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm text-gray-300">Mines</label>
                  <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                      {mineCount}
                  </span>
                </div>
                <input
                  type="range"
                  value={mineCount}
                  onChange={(e) => setMineCount(Number(e.target.value))}
                  min="1"
                  max="24"
                  disabled={playing}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>12</span>
                    <span>24</span>
                </div>
              </div>

              {playing ? (
                  <button
                    onClick={cashout}
                    disabled={revealed.length === 0 || loading}
                    className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white text-lg font-bold shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Coins className="w-5 h-5" /> Cashout ₹{potentialWin}
                  </button>
              ) : (
                  <button
                    onClick={startGame}
                    disabled={loading}
                    className="w-full btn-primary py-4 text-lg font-bold shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Play className="w-5 h-5" /> {loading ? 'Starting...' : 'Start Game'}
                  </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
