import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { WalletService } from '@/services/wallet.service'

/**
 * GET /api/wallet/balance
 * Get user's wallet balances
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wallet = await WalletService.getWallet(session.user.id)

    return NextResponse.json({ success: true, wallet })
  } catch (error) {
    console.error('Wallet balance error:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'An error occurred') || 'Failed to get wallet balance' },
      { status: 500 }
    )
  }
}
