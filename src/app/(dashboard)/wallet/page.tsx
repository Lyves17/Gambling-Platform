'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, Clock, ArrowRight, Lock, Gift, Activity } from 'lucide-react'
import Link from 'next/link'

interface WalletData {
  mainBalance: number
  bonusBalance: number
  lockedBalance: number
  totalBalance: number
  vipLevel: string
  totalWagered: number
}

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  createdAt: string
  description?: string
}

export default function WalletDashboard() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWallet()
    fetchTransactions()
  }, [])

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet/balance')
      const data = await res.json()
      if (data.success) {
        setWallet(data.wallet)
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/wallet/transactions?limit=10')
      const data = await res.json()
      if (data.success) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-gray-950 to-black p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Wallet className="w-6 h-6 text-primary animate-pulse" />
              <span className="text-sm uppercase tracking-wider text-gray-500 font-bold">Financial Hub</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-3 text-white font-heading tracking-tight">
              Total Balance: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-200 to-emerald-400 animate-text-shimmer bg-[length:200%_auto]">₹{wallet?.totalBalance.toFixed(2)}</span>
            </h1>
          </div>
          <div className="flex gap-3">
            <Link href="/deposit">
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all">
                + Deposit
              </button>
            </Link>
            <Link href="/withdraw">
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-bold text-white hover:shadow-[0_0_30px_rgba(251,146,60,0.3)] transition-all">
                Withdraw
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:border-white/20 transition-all overflow-hidden group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Main Balance</p>
                <p className="text-3xl font-bold text-cyan-400 font-heading tracking-tight">₹{wallet?.mainBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bonus Balance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, type: "spring" }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:border-white/20 transition-all overflow-hidden group-hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-7 h-7 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Bonus Balance</p>
                <p className="text-3xl font-bold text-yellow-400 font-heading tracking-tight">₹{wallet?.bonusBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Locked Balance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, type: "spring" }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:border-white/20 transition-all overflow-hidden group-hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock className="w-7 h-7 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Locked Balance</p>
                <p className="text-3xl font-bold text-orange-400 font-heading tracking-tight">₹{wallet?.lockedBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* VIP Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-medium">VIP Level</p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-400 to-primary font-heading">{wallet?.vipLevel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-medium">Total Wagered</p>
              <p className="text-3xl font-bold text-white font-heading">₹{wallet?.totalWagered.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-6 h-3 bg-gray-800 rounded-full overflow-hidden border border-white/10">
            <div className="h-full bg-gradient-to-r from-primary to-yellow-500 rounded-full" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-400 mt-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            ₹40,000 to next level
          </p>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-white">Recent Transactions</h2>
            <Link href="/transactions">
              <button className="text-primary hover:text-primary/80 flex items-center gap-2 font-medium transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-16">
                <Activity className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No transactions yet</p>
                <p className="text-gray-600 text-sm mt-2">Your wallet activity will appear here</p>
              </div>
            ) : (
              transactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-black/20 hover:bg-black/30 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                      tx.amount > 0 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      {tx.amount > 0 ? (
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{tx.type}</p>
                      <p className="text-sm text-gray-400">{tx.description || new Date(tx.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg font-heading ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className={`text-xs font-medium px-2 py-1 rounded-lg ${
                      tx.status === 'COMPLETED' 
                        ? 'bg-green-500/20 text-green-400'
                        : tx.status === 'PENDING'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>{tx.status}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
