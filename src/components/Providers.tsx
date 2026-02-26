"use client"

import { SessionProvider } from "next-auth/react"
import { BalanceProvider } from "@/context/BalanceContext"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BalanceProvider>
        {children}
        <Toaster />
      </BalanceProvider>
    </SessionProvider>
  )
}
