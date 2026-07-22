import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * POST /api/wallet/connect
 * Save connected wallet address to user profile
 */
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { address } = body

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address format' }, { status: 400 })
    }

    // Check if address is already used by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        walletAddress: address,
        id: { not: session.user.id },
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'This wallet address is already linked to another account' }, { status: 400 })
    }

    // Update user with wallet address
    await prisma.user.update({
      where: { id: session.user.id },
      data: { walletAddress: address.toLowerCase() },
    })

    return NextResponse.json({
      success: true,
      walletAddress: address.toLowerCase(),
      message: 'Wallet connected successfully',
    })
  } catch (error) {
    console.error('Wallet connect error:', error)
    return NextResponse.json(
      { error: 'Failed to connect wallet' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/wallet/connect
 * Disconnect wallet from user profile
 */
export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { walletAddress: null },
    })

    return NextResponse.json({
      success: true,
      message: 'Wallet disconnected',
    })
  } catch (error) {
    console.error('Wallet disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect wallet' },
      { status: 500 }
    )
  }
}

export const dynamic = "force-dynamic";
