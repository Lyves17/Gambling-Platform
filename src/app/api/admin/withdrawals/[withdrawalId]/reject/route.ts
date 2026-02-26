import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PaymentService } from '@/services/payment.service'

/**
 * POST /api/admin/withdrawals/[withdrawalId]/reject
 * Reject a withdrawal
 */
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ withdrawalId: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { reason } = body
    const withdrawalId = params.withdrawalId

    if (!reason) {
      return NextResponse.json({ error: 'Reject reason is required' }, { status: 400 })
    }

    await PaymentService.rejectWithdrawal(withdrawalId, session.user.id, reason)

    return NextResponse.json({
      success: true,
      message: 'Withdrawal rejected',
    })
  } catch (error) {
    console.error('Reject withdrawal error:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'An error occurred') || 'Failed to reject withdrawal' },
      { status: 500 }
    )
  }
}
