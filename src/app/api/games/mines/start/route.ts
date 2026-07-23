import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { GameType } from '@prisma/client'
import { ProvablyFairService } from '@/services/provably-fair.service'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mineCount } = await req.json()

    if (!mineCount || mineCount < 1 || mineCount > 24) {
      return NextResponse.json({ error: 'Invalid mine count (1-24)' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mainBalance: true, bonusBalance: true, nonce: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const totalBalance = (user.mainBalance || 0) + (user.bonusBalance || 0)
    const wager = 10 // Default minimum wager for mines

    if (totalBalance < wager) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Generate provably fair seeds
    const serverSeed = ProvablyFairService.generateServerSeed()
    const serverSeedHash = ProvablyFairService.hashServerSeed(serverSeed)
    const clientSeed = session.user.id
    const nonce = user.nonce

    // Generate mine positions using provably fair algorithm
    const minePositions = ProvablyFairService.outcomeToMines(serverSeed, clientSeed, nonce, mineCount)

    // Deduct wager and create bet in transaction
    const result = await prisma.$transaction(async (tx) => {
      let newMain = user.mainBalance
      let newBonus = user.bonusBalance

      if (newMain >= wager) {
        newMain -= wager
      } else {
        newBonus -= (wager - newMain)
        newMain = 0
      }

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          mainBalance: newMain,
          bonusBalance: newBonus,
          nonce: { increment: 1 },
        }
      })

      const bet = await tx.bet.create({
        data: {
          userId: session.user.id,
          game: GameType.MINES,
          wager,
          payout: 0,
          multiplier: 0,
          profit: -wager,
          isWin: false,
          serverSeed,
          serverSeedHash,
          clientSeed,
          nonce,
          result: { minePositions, mineCount, revealed: [] }
        }
      })

      return { betId: bet.id, newBalance: newMain + newBonus }
    })

    return NextResponse.json({
      success: true,
      betId: result.betId,
      minePositions,
      mineCount,
      serverSeedHash,
      newBalance: result.newBalance,
    })

  } catch (error) {
    console.error('Mines start error:', error)
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 })
  }
}
