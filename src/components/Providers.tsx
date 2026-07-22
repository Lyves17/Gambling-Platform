"use client"

import { SessionProvider } from "next-auth/react"
import { BalanceProvider } from "@/context/BalanceContext"
import { Toaster } from "@/components/ui/toaster"
import { Web3Provider } from "@/lib/web3"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <SessionProvider>
        <BalanceProvider>
          {children}
          <Toaster />
        </BalanceProvider>
      </SessionProvider>
    </Web3Provider>
  )
}
