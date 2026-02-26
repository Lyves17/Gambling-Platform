import { GameGrid } from "@/components/GameGrid"
import { RecentBets } from "@/components/RecentBets"
import { Hero } from "@/components/layout/Hero"
import { Features } from "@/components/layout/Features"
import { GlobalStats } from "@/components/GlobalStats"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <Hero />
      
      <GlobalStats />

      {/* Live Bets Ticker */}
      <RecentBets />

      <Features />

      {/* Games Grid */}
      <section className="container relative z-10 py-12 md:py-24 mx-auto px-4">
         <div className="flex flex-col items-center mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-4">Our Games</h2>
            <p className="text-muted-foreground max-w-[600px]">Choose your path to victory. House edge as low as 1%.</p>
         </div>
        
        <GameGrid />
      </section>
    </div>
  )
}
