import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * GET /api/user/stats
 * Get user statistics
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get total bets
    const totalBets = await prisma.bet.count({ where: { userId } })

    // Get wins/losses
    const wins = await prisma.bet.count({ where: { userId, isWin: true } })
    const losses = totalBets - wins

    // Get total wagered
    const wagerData = await prisma.bet.aggregate({
      where: { userId },
      _sum: { wager: true },
    })

    // Get total profit/loss
    const profitData = await prisma.bet.aggregate({
      where: { userId },
      _sum: { profit: true },
    })

    // Get biggest win
    const biggestWin = await prisma.bet.findFirst({
      where: { userId, isWin: true },
      orderBy: { profit: 'desc' },
      select: { profit: true, multiplier: true, game: true },
    })

    // Get favorite game
    const gameStats = await prisma.bet.groupBy({
      by: ['game'],
      where: { userId },
      _count: true,
      orderBy: {
        _count: {
          game: 'desc',
        },
      },
      take: 1,
    })
    // Get user VIP and referral data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        vipLevel: true,
        totalWagered: true,
        referralEarnings: true,
      },
    })

    // Calculate next VIP level threshold
    const vipThresholds: Record<string, number> = {
      BRONZE: 10000,
      SILVER: 50000,
      GOLD: 200000,
      PLATINUM: 1000000,
      DIAMOND: 0,
    }

    const nextLevelMap: Record<string, string> = {
      BRONZE: 'SILVER',
      SILVER: 'GOLD',
      GOLD: 'PLATINUM',
      PLATINUM: 'DIAMOND',
      DIAMOND: 'DIAMOND',
    }

    const currentLevel = user?.vipLevel || 'BRONZE'
    const nextLevel = nextLevelMap[currentLevel]
    const nextLevelWager = vipThresholds[nextLevel] || 0
    const currentWagered = user?.totalWagered || wagerData._sum.wager || 0

    return NextResponse.json({
      success: true,
      stats: {
        totalBets,
        wins,
        losses,
        winRate: totalBets > 0 ? (wins / totalBets) * 100 : 0,
        totalWagered: currentWagered,
        totalWon: wagerData._sum.wager ? (wagerData._sum.wager || 0) + (profitData._sum.profit || 0) : 0,
        netProfit: profitData._sum.profit || 0,
        biggestWin: biggestWin || null,
        favoriteGame: gameStats[0]?.game || null,
        vipLevel: currentLevel,
        vipProgress: nextLevelWager > 0 ? (currentWagered / nextLevelWager) * 100 : 100,
        nextLevelWager,
        referralEarnings: user?.referralEarnings || 0,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'An error occurred') || 'Failed to get stats' },
      { status: 500 }
    )
  }
}
