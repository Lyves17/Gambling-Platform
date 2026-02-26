import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { gameId, multiplier } = await req.json()

    if (!gameId || !multiplier) {
      return NextResponse.json({ error: 'Missing gameId or multiplier' }, { status: 400 })
    }

    // Fetch the bet
    const bet = await prisma.bet.findUnique({
      where: { id: gameId }
    })

    if (!bet) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    if (bet.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (bet.isWin) {
      return NextResponse.json({ error: 'Game already cashed out' }, { status: 400 })
    }

    // Verify the game result
    // In our simplified "Client-Side Real-Time" flow, the server trusted the client to animate/stop.
    // However, the server KNOWS the crash point.
    // We must verify that the requested multiplier <= actual crashPoint.
    const result = bet.result as { crashPoint: number }
    const crashPoint = result.crashPoint

    if (multiplier > crashPoint) {
      // User tried to cash out higher than the crash point (or lag/latency issue)
      // This is technically a LOSS.
      // We don't need to update anything because it's already a loss (idWin=false).
      return NextResponse.json({
        error: 'Crashed before cashout',
        crashedAt: crashPoint
      }, { status: 400 })
    }

    // Valid Cashout
    const payout = bet.wager * multiplier
    const profit = payout - bet.wager

    // Transaction
    const newBalance = await prisma.$transaction(async (tx) => {
      // 1. Update User Balance (Credit Win)
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: {
          mainBalance: { increment: payout }
          // Note: We credit the full payout to main balance for simplicity
          // Adjust logic if bonus wins go to bonus balance
        }
      })

      // 2. Update Bet
      await tx.bet.update({
        where: { id: gameId },
        data: {
          isWin: true,
          multiplier: multiplier,
          payout: payout,
          profit: profit
        }
      })

      // 3. Create Transaction Record
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'WIN',
          amount: payout,
          balanceBefore: (user.mainBalance || 0) - payout,
          balanceAfter: user.mainBalance || 0,
          status: 'COMPLETED',
          description: `Win on Crash (x${multiplier})`,
          referenceId: gameId
        }
      })

      return (user.mainBalance || 0) + (user.bonusBalance || 0)
    })

    return NextResponse.json({
      success: true,
      payout,
      profit,
      newBalance
    })

  } catch (error) {
    console.error('Crash cashout error:', error)
    return NextResponse.json({ error: (error instanceof Error ? error.message : 'An error occurred') || 'Cashout failed' }, { status: 500 })
  }
}
