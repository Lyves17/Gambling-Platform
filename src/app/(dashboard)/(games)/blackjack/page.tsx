import Blackjack from "@/components/games/Blackjack"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blackjack | Gambling Platform",
  description: "Beat the dealer to 21. Provably fair blackjack.",
}

export default function BlackjackPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-heading mb-2 text-white">Blackjack</h1>
        <p className="text-muted-foreground">Beat the dealer to 21 without busting!</p>
      </div>
      <Blackjack />
    </div>
  )
}
