import HiLo from "@/components/games/HiLo"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hi-Lo | Gambling Platform",
  description: "Guess higher or lower. A game of streaks.",
}

export default function HiLoPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-heading mb-2 text-white">Hi-Lo</h1>
        <p className="text-muted-foreground">Guess if the next card is higher or lower!</p>
      </div>
      <HiLo />
    </div>
  )
}
