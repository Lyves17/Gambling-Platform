import Limbo from "@/components/games/Limbo"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Limbo | Gambling Platform",
  description: "Predict the target multiplier. Simple and fast.",
}

export default function LimboPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-heading mb-2 text-white">Limbo</h1>
        <p className="text-muted-foreground">Set your target. If the result is higher, you win!</p>
      </div>
      <Limbo />
    </div>
  )
}
