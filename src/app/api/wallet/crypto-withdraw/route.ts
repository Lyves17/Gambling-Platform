import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { TransactionType, TransactionStatus, PaymentMethod, WithdrawalStatus } from '@prisma/client'
import { IdempotencyService } from '@/services/idempotency.service'

/**
 * POST /api/wallet/crypto-withdraw
 * Request a crypto withdrawal to connected wallet
 * 
 * Body: { amount: number, currency: 'ETH' | 'USDC' }
 * 
 * The platform will process the withdrawal and send crypto
 * from the platform wallet to the user's connected wallet.
 */
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Idempotency check
    const idempotencyKey = req.headers.get('x-idempotency-key')
    if (idempotencyKey) {
      try {
        const lock = await IdempotencyService.lock(idempotencyKey, session.user.id, '/api/wallet/crypto-withdraw', {})
        if (lock.status === 'COMPLETED') {
          return NextResponse.json(lock.response, { status: lock.statusCode })
        }
      } catch {
        return NextResponse.json({ error: 'Request already processing' }, { status: 409 })
      }
    }

    const body = await req.json()
    const { amount, currency } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!['ETH', 'USDC'].includes(currency)) {
      return NextResponse.json({ error: 'Currency must be ETH or USDC' }, { status: 400 })
    }

    // Get user's connected wallet
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletAddress: true, mainBalance: true },
    })

    if (!user?.walletAddress) {
      return NextResponse.json(
        { error: 'No wallet connected. Please connect your MetaMask wallet first.' },
        { status: 400 }
      )
    }

    // Check sufficient balance (minimum 2% fee)
    const fee = Math.max(amount * 0.02, 5)
    const totalDeduct = amount + fee

    if (user.mainBalance < totalDeduct) {
      return NextResponse.json(
        { error: `Insufficient balance. Required: ${totalDeduct.toFixed(2)} (amount + ${fee.toFixed(2)} fee)` },
        { status: 400 }
      )
    }

    // Calculate crypto amount to send
    let cryptoAmount: number
    if (currency === 'ETH') {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      const data = await res.json()
      const ethPrice = data.ethereum?.usd || 2000
      cryptoAmount = (amount / 83) / ethPrice // Convert platform units → USD → ETH
    } else {
      cryptoAmount = amount / 83 // Convert platform units → USDC (1:1 USD)
    }

    // Create withdrawal record
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: session.user.id,
        amount,
        fee,
        finalAmount: amount,
        method: PaymentMethod.CRYPTO,
        status: WithdrawalStatus.PENDING,
        cryptoAddress: user.walletAddress,
      },
    })

    // Lock balance
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          mainBalance: { decrement: totalDeduct },
          lockedBalance: { increment: totalDeduct },
        },
      })

      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: TransactionType.WITHDRAWAL,
          amount: -totalDeduct,
          balanceBefore: user.mainBalance,
          balanceAfter: user.mainBalance - totalDeduct,
          balanceType: 'main',
          status: TransactionStatus.PENDING,
          description: `Crypto withdrawal: ${cryptoAmount.toFixed(6)} ${currency} to ${user.walletAddress}`,
          referenceId: withdrawal.id,
          metadata: {
            currency,
            cryptoAmount,
            walletAddress: user.walletAddress,
          },
        },
      })
    })

    const responseBody = {
      success: true,
      withdrawal: {
        id: withdrawal.id,
        amount,
        fee,
        currency,
        cryptoAmount,
        walletAddress: user.walletAddress,
        status: 'PENDING',
      },
      message: `Withdrawal of ${cryptoAmount.toFixed(6)} ${currency} requested. Processing within 24 hours.`,
    }

    if (idempotencyKey) {
      await IdempotencyService.complete(idempotencyKey, responseBody, 200)
    }

    return NextResponse.json(responseBody)
  } catch (error) {
    console.error('Crypto withdrawal error:', error)
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    )
  }
}

export const dynamic = "force-dynamic";
