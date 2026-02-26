import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PaymentService } from '@/services/payment.service'

/**
 * POST /api/admin/withdrawals/[withdrawalId]/approve
 * Approve a withdrawal
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
    const { notes } = body
    const withdrawalId = params.withdrawalId

    await PaymentService.approveWithdrawal(withdrawalId, session.user.id, notes)

    return NextResponse.json({
      success: true,
      message: 'Withdrawal approved successfully',
    })
  } catch (error) {
    console.error('Approve withdrawal error:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'An error occurred') || 'Failed to approve withdrawal' },
      { status: 500 }
    )
  }
}
