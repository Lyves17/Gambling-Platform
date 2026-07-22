"use client"

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown } from "lucide-react"

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function getExplorerUrl(chainId: number, address: string) {
  const explorers: Record<number, string> = {
    1: "https://etherscan.io",
    137: "https://polygonscan.com",
    42161: "https://arbiscan.io",
    8453: "https://basescan.org",
    11155111: "https://sepolia.etherscan.io",
  }
  return `${explorers[chainId] || "https://etherscan.io"}/address/${address}`
}

export function WalletConnect({ onAddressChange }: { onAddressChange?: (address: string | null) => void }) {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: balance } = useBalance({ address })

  useEffect(() => {
    onAddressChange?.(isConnected ? (address ?? null) : null)
  }, [isConnected, address, onAddressChange])

  const handleConnect = () => {
    const injected = connectors.find((c) => c.id === "injected")
    if (injected) {
      connect({ connector: injected })
    }
  }

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white hover:border-purple-400/50 transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <Wallet className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-sm">{truncateAddress(address)}</span>
          {balance && (
            <span className="text-xs text-gray-400 ml-1">
              {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-72 bg-[#141420] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 space-y-3"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Connected Wallet</p>
                    <p className="text-xs font-mono text-white">{truncateAddress(address)}</p>
                  </div>
                </div>

                {balance && (
                  <div className="p-3 bg-black/40 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">Balance</p>
                    <p className="text-lg font-bold text-white font-heading">
                      {parseFloat(balance.formatted).toFixed(6)} {balance.symbol}
                    </p>
                    <p className="text-xs text-gray-500">
                      on {chain?.name || "Unknown"}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy Address"}
                  </button>

                  <a
                    href={getExplorerUrl(chain?.id || 1, address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Explorer
                  </a>

                  <button
                    onClick={() => { disconnect(); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm hover:from-purple-700 hover:to-blue-700 transition-all hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  )
}
