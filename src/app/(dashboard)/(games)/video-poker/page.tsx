import VideoPoker from "@/components/games/VideoPoker"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Video Poker | Gambling Platform",
  description: "Draw and hold. Build the best poker hand.",
}

export default function VideoPokerPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-heading mb-2 text-white">Video Poker</h1>
        <p className="text-muted-foreground">Draw, hold, and build the best poker hand!</p>
      </div>
      <VideoPoker />
    </div>
  )
}
