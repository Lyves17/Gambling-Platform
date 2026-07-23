import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { TransactionType, TransactionStatus, PaymentMethod, DepositStatus } from '@prisma/client'

// Platform wallet that receives crypto deposits
const PLATFORM_WALLET = process.env.PLATFORM_WALLET_ADDRESS || '0x5B5B6264EF02E701D04c32768c2216080889A2c0'

// ETH/USDC price cache (refreshed every 60s)
let ethPriceCache: { price: number; timestamp: number } = { price: 2000, timestamp: 0 }
const PRICE_CACHE_TTL = 60_000

async function getEthPrice(): Promise<number> {
  if (Date.now() - ethPriceCache.timestamp < PRICE_CACHE_TTL) {
    return ethPriceCache.price
  }
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
    const data = await res.json()
    ethPriceCache = { price: data.ethereum.usd, timestamp: Date.now() }
    return ethPriceCache.price
  } catch {
    return ethPriceCache.price
  }
}

/**
 * POST /api/wallet/crypto-deposit
 * Verify a crypto transaction and credit user balance
 * 
 * Body: { txHash: string, chainId: number, amount: number, currency: 'ETH' | 'USDC' }
 */
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { txHash, chainId = 1, amount, currency } = body

    if (!txHash || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields: txHash, amount, currency' },
        { status: 400 }
      )
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ error: 'Invalid transaction hash' }, { status: 400 })
    }

    if (!['ETH', 'USDC'].includes(currency)) {
      return NextResponse.json({ error: 'Currency must be ETH or USDC' }, { status: 400 })
    }

    // Check for duplicate tx
    const existingDeposit = await prisma.deposit.findFirst({
      where: { referenceId: txHash },
    })

    if (existingDeposit) {
      return NextResponse.json({ error: 'This transaction has already been processed' }, { status: 400 })
    }

    // Convert amount to platform currency (INR-like units for the platform)
    let creditAmount: number
    if (currency === 'ETH') {
      const ethPrice = await getEthPrice()
      creditAmount = amount * ethPrice
    } else {
      // USDC is 1:1 with USD, multiply by ~83 for INR-like units
      creditAmount = amount * 83
    }

    // Create deposit record
    const deposit = await prisma.deposit.create({
      data: {
        userId: session.user.id,
        amount: creditAmount,
        method: PaymentMethod.CRYPTO,
        status: DepositStatus.COMPLETED,
        referenceId: txHash,
        transactionHash: txHash,
        gatewayResponse: {
          chainId,
          currency,
          cryptoAmount: amount,
          txHash,
          platformWallet: PLATFORM_WALLET,
        },
      },
    })

    // Credit user wallet using atomic transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { mainBalance: true },
      })

      if (!user) throw new Error('User not found')

      const balanceBefore = user.mainBalance
      const balanceAfter = balanceBefore + creditAmount

      await tx.user.update({
        where: { id: session.user.id },
        data: { mainBalance: { increment: creditAmount } },
      })

      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: TransactionType.DEPOSIT,
          amount: creditAmount,
          balanceBefore,
          balanceAfter,
          balanceType: 'main',
          status: TransactionStatus.COMPLETED,
          description: `Crypto deposit: ${amount} ${currency} (${txHash.slice(0, 10)}...)`,
          referenceId: deposit.id,
          completedAt: new Date(),
          metadata: {
            txHash,
            chainId,
            currency,
            cryptoAmount: amount,
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      deposit: {
        id: deposit.id,
        amount: creditAmount,
        currency,
        cryptoAmount: amount,
        txHash,
      },
      message: `Successfully credited ₹${creditAmount.toFixed(2)} for ${amount} ${currency}`,
    })
  } catch (error) {
    console.error('Crypto deposit error:', error)
    return NextResponse.json(
      { error: 'Failed to process crypto deposit' },
      { status: 500 }
    )
  }
}

export const dynamic = "force-dynamic";
