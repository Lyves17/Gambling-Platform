import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { betId, revealed } = await req.json()

    if (!betId) {
      return NextResponse.json({ error: 'Missing betId' }, { status: 400 })
    }

    if (!Array.isArray(revealed)) {
      return NextResponse.json({ error: 'Invalid revealed array' }, { status: 400 })
    }

    const bet = await prisma.bet.findUnique({
      where: { id: betId }
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

    const result = bet.result as { minePositions: number[]; mineCount: number; revealed: number[] }
    const minePositions: number[] = result.minePositions
    const mineCount: number = result.mineCount

    // Check if any revealed tile hit a mine
    const hitMine = revealed.some((pos: number) => minePositions.includes(pos))

    if (hitMine) {
      // Player hit a mine — game over, loss confirmed
      await prisma.bet.update({
        where: { id: betId },
        data: {
          result: { minePositions, mineCount, revealed, hitMine: true }
        }
      })
      return NextResponse.json({
        success: true,
        isWin: false,
        payout: 0,
        multiplier: 0,
      })
    }

    // Calculate multiplier based on revealed safe tiles
    const safeTiles = revealed.length
    const totalTiles = 25
    let multiplier = 1.00
    for (let i = 0; i < safeTiles; i++) {
      multiplier *= (totalTiles - i) / (totalTiles - mineCount - i)
    }
    multiplier *= 0.97 // 3% house edge

    const payout = bet.wager * multiplier
    const profit = payout - bet.wager

    // Credit winnings and update bet
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          mainBalance: { increment: payout }
        }
      })

      await tx.bet.update({
        where: { id: betId },
        data: {
          isWin: true,
          payout,
          multiplier,
          profit,
          result: { minePositions, mineCount, revealed, hitMine: false }
        }
      })

      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'WIN',
          amount: payout,
          balanceBefore: (bet.wager * -1),
          balanceAfter: profit,
          status: 'COMPLETED',
          description: `Mines Cashout (${multiplier.toFixed(2)}x)`,
          referenceId: betId
        }
      })
    })

    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mainBalance: true, bonusBalance: true }
    })

    return NextResponse.json({
      success: true,
      isWin: true,
      payout,
      multiplier,
      profit,
      newBalance: (updatedUser?.mainBalance || 0) + (updatedUser?.bonusBalance || 0),
    })

  } catch (error) {
    console.error('Mines cashout error:', error)
    return NextResponse.json({ error: 'Cashout failed' }, { status: 500 })
  }
}
