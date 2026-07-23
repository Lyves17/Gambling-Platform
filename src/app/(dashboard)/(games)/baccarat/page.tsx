import Baccarat from "@/components/games/Baccarat"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Baccarat | Gambling Platform",
  description: "Player or Banker? Classic high-stakes card game.",
}

export default function BaccaratPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-heading mb-2 text-white">Baccarat</h1>
        <p className="text-muted-foreground">Bet on Player or Banker. Hand closest to 9 wins!</p>
      </div>
      <Baccarat />
    </div>
  )
}
