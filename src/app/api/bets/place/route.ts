import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { BettingService } from '@/services/betting.service'
import { GameType } from '@prisma/client'

/**
 * POST /api/bets/place
 * Place a bet
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { game, wager, clientSeed, gameConfig } = body

    // Validate inputs
    if (!game || !wager) {
      return NextResponse.json(
        { error: 'Game and wager are required' },
        { status: 400 }
      )
    }

    if (!Object.values(GameType).includes(game)) {
      return NextResponse.json({ error: 'Invalid game type' }, { status: 400 })
    }

    if (wager <= 0) {
      return NextResponse.json({ error: 'Wager must be positive' }, { status: 400 })
    }

    const result = await BettingService.placeBet({
      userId: session.user.id,
      game,
      wager,
      clientSeed,
      gameConfig,
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Place bet error:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'An error occurred') || 'Failed to place bet' },
      { status: 500 }
    )
  }
}
