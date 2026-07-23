import Wheel from "@/components/games/Wheel"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wheel | Gambling Platform",
  description: "Spin the lucky wheel for instant multipliers.",
}

export default function WheelPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-heading mb-2 text-white">Wheel</h1>
        <p className="text-muted-foreground">Spin the wheel and win up to 50x!</p>
      </div>
      <Wheel />
    </div>
  )
}
