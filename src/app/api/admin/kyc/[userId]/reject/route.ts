import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { AuditService } from '@/services/audit.service'

const rejectSchema = z.object({
  reason: z.string().min(1),
})

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { reason } = rejectSchema.parse(body)
    const { userId } = params

    // Reject KYC
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'REJECTED',
        kycRejectionReason: reason,
        kycApprovedAt: null,
      },
    })

    // Log the action
    await AuditService.log({
      userId: admin.id,
      action: 'KYC_REJECTED',
      resource: 'USER',
      resourceId: userId,
      changes: { status: 'REJECTED', reason, details: `KYC documents rejected: ${reason}` },
    })

    return NextResponse.json({
      success: true,
      message: 'KYC rejected',
    })
  } catch (error) {
    console.error('KYC reject error:', error)
    const message = error instanceof Error ? error.message : 'Failed to reject KYC'
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 })
  }
}
