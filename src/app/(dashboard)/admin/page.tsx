'use client'

import { motion } from 'framer-motion'
import { AdminStatsOverview } from '@/components/dashboard/AdminStatsOverview'
import { AdminAnalytics } from '@/components/dashboard/AdminAnalytics'
import { Shield, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { AuditLogViewer } from '@/components/dashboard/AuditLogViewer'

export default function AdminDashboard() {
  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold font-orbitron text-white mb-2">
            🛡️ Command Center
          </h1>
          <p className="text-gray-400">Real-time platform monitoring and administration</p>
        </div>
        <div className="flex gap-3">
            <Link href="/admin/finance">
                <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <ArrowUpRight className="w-4 h-4" />
                    Pending Withdrawals
                </button>
            </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <AdminStatsOverview />

      {/* Analytics & Activity Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <AdminAnalytics />
        </div>
        
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Recent Admin Actions
                </h3>
                <Link href="/admin/audit" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
            </div>
            {/* We'll make a condensed version or just reuse the viewer constrained */}
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <AuditLogViewer />
            </div>
        </div>
      </div>
    </div>
  )
}
