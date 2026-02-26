'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Trophy, Gift, Users, TrendingUp, Copy, Check, Crown, Star, Zap, Target, Award, Calendar } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  referralCode: string
  vipLevel: string
  totalWagered: number
  referralEarnings: number
  createdAt: string
}

interface UserStats {
  totalBets: number
  wins: number
  losses: number
  winRate: number
  totalWagered: number
  totalProfit: number
  biggestWin: { profit: number } | null
  favoriteGame: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      if (data.success) {
        setProfile(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const copyReferralCode = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-4 border-primary"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Premium Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-gray-950 to-black p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className={"w-24 h-24 rounded-full bg-gradient-to-br " + getVIPColor(profile?.vipLevel || '') + " flex items-center justify-center text-4xl font-bold shadow-[0_0_40px_rgba(251,191,36,0.3)] relative"}
              >
                {profile?.name?.charAt(0).toUpperCase() || 'U'}
                <div className="absolute -bottom-2 -right-2 bg-black rounded-full p-1.5 border-2 border-yellow-400">
                  <Crown className="w-5 h-5 text-yellow-400" />
                </div>
              </motion.div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl md:text-5xl font-bold text-white font-heading">{profile?.name || 'User'}</h1>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={"px-3 py-1 rounded-full bg-gradient-to-r " + getVIPColor(profile?.vipLevel || '') + " text-black text-sm font-bold flex items-center gap-1 shadow-lg"}
                  >
                    <Trophy className="w-4 h-4" />
                    {profile?.vipLevel || 'BRONZE'}
                  </motion.div>
                </div>
                <p className="text-gray-400 flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  {profile?.email}
                </p>
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(profile?.createdAt || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-green-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm text-gray-400 mb-1">Total Bets</p>
              <p className="text-3xl font-bold text-white font-heading">{stats?.totalBets || 0}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-yellow-400" />
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-400 mb-1">Win Rate</p>
              <p className="text-3xl font-bold text-yellow-400 font-heading">{(stats?.winRate || 0).toFixed(1)}%</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <Award className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-sm text-gray-400 mb-1">Total Wagered</p>
              <p className="text-3xl font-bold text-white font-heading">₹{(stats?.totalWagered || 0).toFixed(0)}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="relative group"
          >
            <div className={"absolute -inset-0.5 bg-gradient-to-r " + ((stats?.totalProfit || 0) >= 0 ? 'from-green-500/20 to-emerald-500/20' : 'from-red-500/20 to-pink-500/20') + " rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"} />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className={"w-8 h-8 " + ((stats?.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400')} />
                <TrendingUp className={"w-5 h-5 " + ((stats?.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400')} />
              </div>
              <p className="text-sm text-gray-400 mb-1">Total Profit</p>
              <p className={"text-3xl font-bold font-heading " + ((stats?.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400')}>
                ₹{(stats?.totalProfit || 0).toFixed(2)}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Referral Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-white font-heading">Refer & Earn</h3>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border-2 border-primary/30 shadow-[0_0_30px_rgba(251,191,36,0.15)]">
                  <code className="flex-1 text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 text-center font-mono">
                    {profile?.referralCode}
                  </code>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={copyReferralCode}
                    className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-primary" />}
                  </motion.button>
                </div>
              </div>

              <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-green-400" />
                  <span className="font-bold text-green-400">Referral Earnings</span>
                </div>
                <p className="text-3xl font-bold text-white font-heading">₹{(profile?.referralEarnings || 0).toFixed(2)}</p>
              </div>

              <div className="space-y-2 text-sm bg-black/20 p-4 rounded-xl">
                <p className="text-gray-400 font-medium mb-2">🎁 Earn rewards:</p>
                <ul className="text-gray-300 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    ₹50 on signup
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    ₹100 first deposit
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    ₹20 per ₹1000 wagered
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Detailed Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-6 font-heading flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Betting Statistics
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Wins
                  </p>
                  <p className="text-4xl font-bold text-green-400 font-heading">{stats?.wins || 0}</p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20">
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Losses
                  </p>
                  <p className="text-4xl font-bold text-red-400 font-heading">{stats?.losses || 0}</p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Biggest Win
                  </p>
                  <p className="text-4xl font-bold text-yellow-400 font-heading">₹{(stats?.biggestWin?.profit || 0).toFixed(0)}</p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Favorite Game
                  </p>
                  <p className="text-2xl font-bold text-white font-heading">{stats?.favoriteGame || 'None'}</p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Total Wagered
                  </p>
                  <p className="text-3xl font-bold text-white font-heading">₹{(stats?.totalWagered || 0).toFixed(0)}</p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Win Rate
                  </p>
                  <p className="text-3xl font-bold text-primary font-heading">{(stats?.winRate || 0).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
