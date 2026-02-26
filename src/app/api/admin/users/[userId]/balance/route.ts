
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth()
  const { userId } = await params

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { amount, type, reason } = await req.json()

    if (!amount || !type || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (type === 'DEBIT' && user.mainBalance < numericAmount) {
      return NextResponse.json({ error: 'Insufficient user balance' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      const balanceBefore = user.mainBalance
      const balanceAfter = type === 'CREDIT' ? balanceBefore + numericAmount : balanceBefore - numericAmount

      // 1. Update User Balance
      await tx.user.update({
        where: { id: userId },
        data: { mainBalance: balanceAfter }
      })

      // 2. Create Transaction Record
      await tx.transaction.create({
        data: {
          userId,
          amount: numericAmount,
          type: 'ADJUSTMENT', // Using correct enum
          status: 'COMPLETED',
          balanceBefore,
          balanceAfter,
          description: reason,
          metadata: {
            adjustmentType: type, // CREDIT or DEBIT
            adminId: session.user.id,
            reason
          }
        }
      })

      // 3. Create Audit Log
      await tx.auditLog.create({
        data: {
          action: 'BALANCE_ADJUSTMENT',
          resource: 'USER_WALLET',
          resourceId: userId,
          changes: { type, amount: numericAmount, reason, balanceBefore, balanceAfter },
          userId: session.user.id, // Admin ID
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
        }
      })
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Balance adjustment error:', error)
    return NextResponse.json({ error: 'Failed to adjust balance' }, { status: 500 })
  }
}
