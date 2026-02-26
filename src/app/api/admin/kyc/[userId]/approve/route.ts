import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AuditService } from '@/services/audit.service'

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

    const { userId } = params

    // Approve KYC
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'APPROVED',
        kycApprovedAt: new Date(),
        kycRejectionReason: null,
      },
    })

    // Log the action
    await AuditService.log({
      userId: admin.id,
      action: 'KYC_APPROVED',
      resource: 'USER',
      resourceId: userId,
      changes: { status: 'APPROVED', details: 'KYC documents approved' },
    })

    return NextResponse.json({
      success: true,
      message: 'KYC approved successfully',
    })
  } catch (error) {
    console.error('KYC approve error:', error)
    const message = error instanceof Error ? error.message : 'Failed to approve KYC'
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 })
  }
}
