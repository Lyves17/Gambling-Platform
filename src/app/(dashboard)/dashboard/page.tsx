"use client"

import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Wallet, TrendingUp, Trophy, Target, Zap, Crown, 
  Gamepad2, ArrowUpRight, ArrowDownRight, Clock, 
  Star, Gift, Copy, Check,
  ChevronRight, Activity, BarChart3, DollarSign,
  TrendingDown, Calendar, Percent
} from "lucide-react"
import Link from "next/link"
import { ActiveRace } from "@/components/dashboard/ActiveRace"
import { Leaderboard } from "@/components/dashboard/Leaderboard"

interface UserStats {
  totalBets: number
  wins: number
  losses: number
  winRate: number
  totalWagered: number
  netProfit: number
  biggestWin: {
    profit: number
  } | null
  favoriteGame: string | null
  vipLevel: string
  vipProgress: number
  nextLevelWager: number
  referralEarnings: number
}

interface RecentBet {
  id: string
  game: string
  wager: number
  multiplier: number
  payout: number
  profit: number
  isWin: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentBets, setRecentBets] = useState<RecentBet[]>([])
  const [referralCode, setReferralCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      router.push('/admin')
    }
  }, [session, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, betsRes, profileRes, balanceRes] = await Promise.all([
          fetch('/api/user/stats'),
          fetch('/api/bets/recent?limit=8&user=true'),
          fetch('/api/user/profile'),
          fetch('/api/wallet/balance')
        ])

        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data.stats)
        }

        if (betsRes.ok) {
          const data = await betsRes.json()
          setRecentBets(data.bets || [])
        }

        if (profileRes.ok) {
          const data = await profileRes.json()
          setReferralCode(data.user?.referralCode || '')
        }

        if (balanceRes.ok) {
          const data = await balanceRes.json()
          setBalance(data.wallet?.totalBalance ?? 0)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchData()
    }
  }, [session])

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const quickActions = [
    { name: "Deposit Funds", icon: ArrowDownRight, href: "/deposit", color: "from-green-500 to-emerald-500", desc: "Add money to wallet" },
    { name: "Withdraw", icon: ArrowUpRight, href: "/withdraw", color: "from-red-500 to-pink-500", desc: "Cash out winnings" },
    { name: "All Games", icon: Gamepad2, href: "/games", color: "from-blue-500 to-cyan-500", desc: "Browse games" },
    { name: "History", icon: Activity, href: "/transactions", color: "from-purple-500 to-pink-500", desc: "View transactions" },
  ]

  const getVIPColor = () => {
    const level = stats?.vipLevel?.toUpperCase()
    switch(level) {
      case 'PLATINUM': return { bg: 'from-cyan-400 to-blue-400', text: 'text-cyan-400', glow: 'shadow-[0_0_40px_rgba(34,211,238,0.3)]' }
      case 'GOLD': return { bg: 'from-yellow-400 to-orange-400', text: 'text-yellow-400', glow: 'shadow-[0_0_40px_rgba(251,191,36,0.3)]' }
      case 'SILVER': return { bg: 'from-gray-300 to-gray-400', text: 'text-gray-300', glow: 'shadow-[0_0_40px_rgba(209,213,219,0.3)]' }
      case 'DIAMOND': return { bg: 'from-purple-400 to-pink-400', text: 'text-purple-400', glow: 'shadow-[0_0_40px_rgba(168,85,247,0.3)]' }
      default: return { bg: 'from-green-400 to-emerald-400', text: 'text-green-400', glow: 'shadow-[0_0_40px_rgba(34,197,94,0.3)]' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-gray-950 to-black p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse-slow" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Gaming Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-2">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">{session?.user?.name || "Player"}</span>
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`px-6 py-3 rounded-2xl bg-gradient-to-r ${getVIPColor().bg} ${getVIPColor().glow} flex items-center gap-3`}
            >
              <Crown className="w-6 h-6 text-black" />
              <div>
                <p className="text-xs text-black/70 font-medium">VIP Status</p>
                <p className="text-black font-bold text-lg">{stats?.vipLevel || 'BRONZE'}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Balance Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-orange-500/40 to-primary/40 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse-slow" />
          <div className="relative bg-gradient-to-br from-black via-gray-950 to-black border border-white/10 rounded-3xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-6 h-6 text-primary" />
                  <p className="text-gray-400 text-sm uppercase tracking-wider font-bold">Available Balance</p>
                </div>
                <h2 className="text-6xl font-bold text-white font-heading mb-6">₹{balance.toFixed(2)}</h2>
                <div className="flex gap-3">
                  <Link href="/deposit" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                    >
                      <ArrowDownRight className="w-5 h-5" />
                      Deposit
                    </motion.button>
                  </Link>
                  <Link href="/withdraw" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                      Withdraw
                    </motion.button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <p className="text-gray-400 text-xs">Total Wagered</p>
                  </div>
                  <p className="text-2xl font-bold text-white font-heading">₹{(stats?.totalWagered || 0).toFixed(0)}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className={`w-4 h-4 ${(stats?.netProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                    <p className="text-gray-400 text-xs">Net Profit</p>
                  </div>
                  <p className={`text-2xl font-bold font-heading ${(stats?.netProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{(stats?.netProfit || 0).toFixed(2)}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="w-4 h-4 text-yellow-400" />
                    <p className="text-gray-400 text-xs">Win Rate</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400 font-heading">{(stats?.winRate || 0).toFixed(1)}%</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <p className="text-gray-400 text-xs">Biggest Win</p>
                  </div>
                  <p className="text-2xl font-bold text-primary font-heading">₹{(stats?.biggestWin?.profit || 0).toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Trophy className="w-8 h-8 text-green-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Wins</p>
              <p className="text-3xl font-bold text-green-400 font-heading">{stats?.wins || 0}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Target className="w-8 h-8 text-red-400" />
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Losses</p>
              <p className="text-3xl font-bold text-red-400 font-heading">{stats?.losses || 0}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Gamepad2 className="w-8 h-8 text-blue-400" />
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Bets</p>
              <p className="text-3xl font-bold text-white font-heading">{stats?.totalBets || 0}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Star className="w-8 h-8 text-purple-400" />
                <Gamepad2 className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Favorite Game</p>
              <p className="text-lg font-bold text-white font-heading truncate">{stats?.favoriteGame || 'None'}</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white font-heading flex items-center gap-3">
                  <Activity className="w-6 h-6 text-primary" />
                  Recent Activity
                </h3>
                <Link href="/transactions">
                  <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              {recentBets.length === 0 ? (
                <div className="text-center py-16">
                  <Gamepad2 className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg font-medium">No recent bets yet</p>
                  <p className="text-gray-600 text-sm mt-2">Start playing to see your activity!</p>
                  <Link href="/games">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl font-bold"
                    >
                      Browse Games
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {recentBets.map((bet, index) => (
                      <motion.div
                        key={bet.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${bet.isWin ? 'from-green-500/20 to-emerald-500/20' : 'from-red-500/20 to-pink-500/20'} border ${bet.isWin ? 'border-green-500/30' : 'border-red-500/30'}`}>
                            <Gamepad2 className={`w-6 h-6 ${bet.isWin ? 'text-green-400' : 'text-red-400'}`} />
                          </div>
                          <div>
                            <p className="text-white font-bold text-lg">{bet.game}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-gray-400 text-sm flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(bet.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <span className="text-gray-600">•</span>
                              <p className="text-gray-400 text-sm">{bet.multiplier.toFixed(2)}x</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold font-heading ${bet.isWin ? 'text-green-400' : 'text-red-400'}`}>
                            {bet.isWin ? '+' : '-'}₹{Math.abs(bet.profit).toFixed(2)}
                          </p>
                          <p className={`text-xs font-medium mt-1 ${bet.isWin ? 'text-green-400/70' : 'text-red-400/70'}`}>
                            {bet.isWin ? 'WON' : 'LOST'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white font-heading mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link key={action.name} href={action.href}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                            <action.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-bold">{action.name}</p>
                            <p className="text-gray-400 text-xs">{action.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Active Race Widget */}
            <ActiveRace />

            {/* Leaderboard */}
            <Leaderboard />

            {/* VIP Progress */}
            {stats && stats.vipLevel !== 'DIAMOND' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/30 backdrop-blur-xl rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-white font-heading">VIP Progress</h3>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress to next level</span>
                    <span className="text-primary font-bold">{stats.vipProgress.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.vipProgress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full bg-gradient-to-r ${getVIPColor().bg} rounded-full`}
                    />
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  Wager <span className="text-white font-bold">₹{((stats.nextLevelWager || 0) - (stats.totalWagered || 0)).toFixed(0)}</span> more to reach next level
                </p>
              </motion.div>
            )}

            {/* Referral */}
            {referralCode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-xl rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white font-heading">Refer & Earn</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">Share and earn <span className="text-purple-400 font-bold">10%</span> commission!</p>
                <div className="flex items-center gap-2 p-3 bg-black/40 rounded-xl border border-white/10 mb-3">
                  <code className="flex-1 text-purple-400 font-mono font-bold text-center tracking-wider">{referralCode}</code>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={copyReferralCode}
                    className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
                  </motion.button>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-green-400 text-sm font-bold">Total Earnings: ₹{(stats?.referralEarnings || 0).toFixed(2)}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
