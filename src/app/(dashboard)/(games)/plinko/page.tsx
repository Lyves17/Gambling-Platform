
import PlinkoGame from "@/components/games/plinko/PlinkoGame"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Plinko | Gambling Platform",
  description: "Play Plinko with crypto. Provably fair gaming.",
}

export default function PlinkoPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-heading mb-2 text-white">Plinko</h1>
        <p className="text-muted-foreground">Drop the ball and multiply your crypto!</p>
      </div>
      
      <PlinkoGame />
    </div>
  )
}
