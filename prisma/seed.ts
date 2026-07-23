import { PrismaClient, GameType } from '@prisma/client'

const prisma = new PrismaClient()

const GAME_SETTINGS = [
  { game: GameType.SLOTS, houseEdge: 3.0, minBet: 1, maxBet: 10000 },
  { game: GameType.ROULETTE, houseEdge: 2.7, minBet: 10, maxBet: 50000 },
  { game: GameType.BLACKJACK, houseEdge: 1.5, minBet: 50, maxBet: 25000 },
  { game: GameType.BACCARAT, houseEdge: 1.06, minBet: 50, maxBet: 25000 },
  { game: GameType.MINES, houseEdge: 2.0, minBet: 10, maxBet: 10000 },
  { game: GameType.CRASH, houseEdge: 3.0, minBet: 10, maxBet: 10000 },
  { game: GameType.DICE, houseEdge: 2.0, minBet: 1, maxBet: 10000 },
  { game: GameType.COINFLIP, houseEdge: 2.0, minBet: 10, maxBet: 10000 },
  { game: GameType.PLINKO, houseEdge: 2.0, minBet: 10, maxBet: 10000 },
  { game: GameType.WHEEL, houseEdge: 5.0, minBet: 10, maxBet: 10000 },
]

async function main() {
  console.log('Seeding GameSettings...')

  for (const setting of GAME_SETTINGS) {
    const existing = await prisma.gameSettings.findUnique({
      where: { game: setting.game },
    })

    if (!existing) {
      await prisma.gameSettings.create({ data: setting })
      console.log(`  Created: ${setting.game}`)
    } else {
      console.log(`  Exists:  ${setting.game}`)
    }
  }

  console.log('GameSettings seed complete.')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
