"use client"

import { type ReactNode } from "react"
import { WagmiProvider, createConfig, http } from "wagmi"
import { mainnet, polygon, arbitrum, base, sepolia } from "wagmi/chains"
import { injected } from "wagmi/connectors"

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum, base, sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
})

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  )
}
