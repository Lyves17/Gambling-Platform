import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface LeaderboardEntry {
  _id: string
  totalWagered: number
  user: {
    name: string
    image: string | null
    vipLevel: string
  }
}

export async function GET() {
  try {
    const now = new Date()

    // 1. Find active race
    const activeRace = await prisma.race.findFirst({
      where: {
        status: 'ACTIVE',
        startTime: { lte: now },
        endTime: { gte: now }
      }
    })

    if (!activeRace) {
      // Check for upcoming
      const upcomingRace = await prisma.race.findFirst({
        where: {
          status: 'UPCOMING',
          startTime: { gt: now }
        },
        orderBy: { startTime: 'asc' }
      })

      return NextResponse.json({
        active: false,
        upcoming: upcomingRace || null
      })
    }

    // 2. Aggregate Leaderboard for this race
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(activeRace.startTime),
            $lte: new Date(activeRace.endTime)
          }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalWagered: { $sum: '$wager' },
          betsCount: { $sum: 1 }
        }
      },
      { $sort: { totalWagered: -1 } },
      { $limit: 10 }
    ]

    interface MongoAggregateResult {
      cursor: {
        firstBatch: {
          _id: string
          totalWagered: number
          betsCount: number
        }[]
      }
    }

    const leaderboardRaw = await prisma.$runCommandRaw({
      aggregate: 'Bet',
      pipeline: pipeline,
      cursor: {}
    }) as unknown as MongoAggregateResult

    const topUsers = leaderboardRaw.cursor.firstBatch

    // 3. Fetch user details
    const userIds = topUsers.map((u) => u._id)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        image: true,
        vipLevel: true
      }
    })

    // 4. Merge data
    const leaderboard: LeaderboardEntry[] = topUsers.map((u) => {
      const user = users.find((user) => user.id === u._id)
      return {
        _id: u._id,
        totalWagered: u.totalWagered,
        user: {
          name: user?.name || 'Unknown User',
          image: user?.image || null,
          vipLevel: user?.vipLevel || 'BRONZE'
        }
      }
    })

    return NextResponse.json({
      active: true,
      race: activeRace,
      leaderboard
    })

  } catch (error) {
    console.error('Race API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch race data' }, { status: 500 })
  }
}


export const dynamic = "force-dynamic";
