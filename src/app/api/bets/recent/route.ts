import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const userSpecific = searchParams.get('user') === 'true'

    // For user's own dashboard - show their bets
    if (session?.user?.id && userSpecific) {
      const bets = await prisma.bet.findMany({
        where: { userId: session.user.id },
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          game: true,
          wager: true,
          multiplier: true,
          payout: true,
          profit: true,
          isWin: true,
          createdAt: true,
        }
      })

      return NextResponse.json({ success: true, bets })
    }

    // For public display (homepage ticker, etc.) - show global bets with masked usernames
    const bets = await prisma.bet.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    // Manual user fetch placeholder
    const userIds = [...new Set(bets.map(b => b.userId))]

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true, avatar: true }
    })
    const userMap = new Map(users.map(u => [u.id, u]))

    const formattedBets = bets.map(bet => {
      // Safety checks for required fields
      const wager = bet.wager ?? 0
      const multiplier = bet.multiplier ?? 0
      const payout = bet.payout ?? 0

      const user = userMap.get(bet.userId)
      const name = user?.name || 'Anonymous'
      const maskedName = name.length > 2
        ? `${name.substring(0, 2)}***${name.substring(name.length - 1)}`
        : '***'

      // Get avatar (support both fields)
      const avatar = user?.avatar || user?.image || '/avatars/default.png'

      return {
        id: bet.id,
        user: maskedName,
        avatar: avatar,
        game: bet.game,
        wager: typeof wager === 'number' ? wager.toFixed(2) : String(wager),
        multiplier: typeof multiplier === 'number' ? multiplier.toFixed(2) : String(multiplier),
        payout: typeof payout === 'number' ? payout.toFixed(2) : String(payout),
        won: bet.isWin,
        isWin: bet.isWin
      }
    })

    return NextResponse.json({ success: true, bets: formattedBets })
  } catch (error) {
    console.error('Failed to fetch recent bets:', error)
    // Return detailed error in dev mode for easier debugging
    const errorMessage = process.env.NODE_ENV === 'development'
      ? (error instanceof Error ? error.message : String(error))
      : 'Database error'

    const errorStack = process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.stack
      : undefined

    return NextResponse.json({ success: false, error: errorMessage, stack: errorStack }, { status: 500 })
  }
}
