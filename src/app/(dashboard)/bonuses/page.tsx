'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gift, Clock, CheckCircle, Zap, Shield, Star, AlertCircle, RefreshCw, Trophy } from 'lucide-react'

interface Bonus {
  id: string
  type: string
  amount: number
  wagerRequired: number
  wagerCompleted: number
  status: string
  expiresAt: string | null
  claimedAt: string
}

export default function BonusesPage() {
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [claimedToday, setClaimedToday] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchBonuses()
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const fetchBonuses = async () => {
    try {
      const res = await fetch('/api/bonuses/active')
      const data = await res.json()
      if (data.success) {
        setBonuses(data.bonuses || [])
        const todayClaim = data.bonuses?.find(
          (b: Bonus) => b.type === 'DAILY' && new Date(b.claimedAt).toDateString() === new Date().toDateString()
        )
        if (todayClaim) setClaimedToday(true)
      }
    } catch (error) {
      console.error('Failed to fetch bonuses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimDaily = async () => {
    setClaiming(true)
    try {
      const res = await fetch('/api/bonuses/daily', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setClaimedToday(true)
        setToast({ message: 'Daily reward claimed! ₹10 added to your bonus balance.', type: 'success' })
        fetchBonuses()
      } else {
        setToast({ message: data.error || 'Already claimed today', type: 'error' })
      }
    } catch {
      setToast({ message: 'Failed to claim daily reward', type: 'error' })
    } finally {
      setClaiming(false)
    }
  }

  const getBonusIcon = (type: string) => {
    switch (type) {
      case 'SIGNUP': return <Star className="w-5 h-5" />
      case 'DAILY': return <Gift className="w-5 h-5" />
      case 'CASHBACK': return <RefreshCw className="w-5 h-5" />
      case 'DEPOSIT': return <Zap className="w-5 h-5" />
      case 'REFERRAL': return <Trophy className="w-5 h-5" />
      case 'VIP': return <Shield className="w-5 h-5" />
      default: return <Gift className="w-5 h-5" />
    }
  }

  const getBonusColor = (type: string) => {
    switch (type) {
      case 'SIGNUP': return 'from-yellow-500 to-orange-500'
      case 'DAILY': return 'from-green-500 to-emerald-500'
      case 'CASHBACK': return 'from-blue-500 to-cyan-500'
      case 'DEPOSIT': return 'from-purple-500 to-pink-500'
      case 'REFERRAL': return 'from-indigo-500 to-violet-500'
      case 'VIP': return 'from-amber-500 to-yellow-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getWagerProgress = (bonus: Bonus) => {
    if (bonus.wagerRequired === 0) return 100
    return Math.min(100, (bonus.wagerCompleted / bonus.wagerRequired) * 100)
  }

  return (
    <div className="space-y-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl font-bold text-sm ${
          toast.type === 'success'
            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
            : 'bg-red-500/20 border border-red-500/50 text-red-400'
        }`}>
          {toast.message}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-gray-950 to-black p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] animate-pulse-slow" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Gift className="w-6 h-6 text-yellow-400 animate-pulse" />
            <span className="text-sm uppercase tracking-wider text-gray-500 font-bold">Rewards & Bonuses</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-3 text-white font-heading tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-200 to-yellow-400 animate-text-shimmer bg-[length:200%_auto]">Bonuses</span>
          </h1>
          <p className="text-gray-400 text-lg">Claim rewards and track your active bonuses.</p>
        </div>
      </motion.div>

      {/* Daily Claim */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-heading">Daily Login Reward</h2>
                <p className="text-gray-400">Claim ₹10 free every day just for logging in!</p>
                <p className="text-xs text-gray-500 mt-1">5x wagering requirement before withdrawal</p>
              </div>
            </div>
            <button
              onClick={handleClaimDaily}
              disabled={claiming || claimedToday}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 ${
                claimedToday
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)]'
              }`}
            >
              {claiming ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                  Claiming...
                </span>
              ) : claimedToday ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Claimed Today
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Claim ₹10
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white font-heading mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Active Bonuses
            </h2>

            {loading ? (
              <div className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400 mx-auto mb-4" />
                <p className="text-gray-400">Loading bonuses...</p>
              </div>
            ) : bonuses.length === 0 ? (
              <div className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-12 text-center">
                <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Active Bonuses</h3>
                <p className="text-gray-400">Claim your daily reward above or make a deposit to earn bonuses!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bonuses.map((bonus, i) => {
                  const progress = getWagerProgress(bonus)
                  const isExpired = bonus.expiresAt && new Date(bonus.expiresAt) < new Date()

                  return (
                    <motion.div
                      key={bonus.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-xl p-5 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getBonusColor(bonus.type)} flex items-center justify-center`}>
                          {getBonusIcon(bonus.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-white">{bonus.type}</h3>
                            <span className="text-lg font-bold text-green-400 font-heading">₹{bonus.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              bonus.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                              bonus.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {bonus.status}
                            </span>
                            {isExpired && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                                Expired
                              </span>
                            )}
                            {bonus.expiresAt && !isExpired && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Expires {new Date(bonus.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Wagering: ₹{bonus.wagerCompleted.toFixed(0)} / ₹{bonus.wagerRequired.toFixed(0)}</span>
                              <span>{progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 font-heading text-lg">Available Bonuses</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-black/40 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Signup Bonus</p>
                    <p className="text-gray-500">₹100 on registration</p>
                  </div>
                </div>
                <div className="p-3 bg-black/40 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Daily Login</p>
                    <p className="text-gray-500">₹10 free every day</p>
                  </div>
                </div>
                <div className="p-3 bg-black/40 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Cashback</p>
                    <p className="text-gray-500">5-25% on losses</p>
                  </div>
                </div>
                <div className="p-3 bg-black/40 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Referral</p>
                    <p className="text-gray-500">Earn ₹50-100 per friend</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 font-heading text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Wagering Rules
              </h3>
              <ul className="text-sm text-gray-400 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">&#10003;</span>
                  Bonus funds must be wagered before withdrawal
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">&#10003;</span>
                  Different bonuses have different multipliers
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">&#10003;</span>
                  Real balance is used first for bets
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">&#10003;</span>
                  Expired bonuses are automatically cancelled
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
