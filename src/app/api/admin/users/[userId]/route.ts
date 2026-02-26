import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * PUT /api/admin/users/[userId]
 * Update user details (Admin only)
 */
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if requester is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = params
    const body = await req.json()
    const {
      name,
      email,
      role,
      vipLevel,
      kycStatus,
      isBanned
    } = body

    // Perform the update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role,
        vipLevel,
        kycStatus,
        isBanned
      },
    })

    // Log the action (Optional but recommended)
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_USER',
        userId: session.user.id, // The admin performing the action
        resource: 'USER',
        resourceId: userId,
        changes: body,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'An error occurred') || 'Failed to update user' },
      { status: 500 }
    )
  }
}
