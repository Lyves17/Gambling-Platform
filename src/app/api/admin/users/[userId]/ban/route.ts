import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AuditService } from '@/services/audit.service'

/**
 * POST /api/admin/users/[userId]/ban
 * Ban/unban a user
 */
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ userId: string }> }
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
    const { isBanned, banReason } = body
    const userId = params.userId

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned,
        banReason: isBanned ? banReason : null,
      },
    })

    await AuditService.logAdminAction(
      session.user.id,
      isBanned ? 'BAN_USER' : 'UNBAN_USER',
      userId,
      { isBanned, banReason }
    )

    return NextResponse.json({
      success: true,
      message: isBanned ? 'User banned' : 'User unbanned',
      user: {
        id: user.id,
        isBanned: user.isBanned,
      },
    })
  } catch (error) {
    console.error('Ban user error:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'An error occurred') || 'Failed to ban user' },
      { status: 500 }
    )
  }
}
