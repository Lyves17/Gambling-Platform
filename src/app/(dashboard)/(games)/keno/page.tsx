import Keno from "@/components/games/Keno"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Keno | Gambling Platform",
  description: "Pick lucky numbers and win big.",
}

export default function KenoPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-heading mb-2 text-white">Keno</h1>
        <p className="text-muted-foreground">Pick your lucky numbers and win up to 100x!</p>
      </div>
      <Keno />
    </div>
  )
}
