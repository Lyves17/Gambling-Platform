import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ balance: 0 }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { mainBalance: true, bonusBalance: true },
    })

    return NextResponse.json({
      mainBalance: user?.mainBalance || 0,
      bonusBalance: user?.bonusBalance || 0,
      totalBalance: (user?.mainBalance || 0) + (user?.bonusBalance || 0)
    })
  } catch (error) {
    console.error("Failed to fetch balance:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { amount, type, balanceType = 'main' } = await req.json()

    // Simple transaction logic for now. 
    // In real app, use transactions and verify game logic here.

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Determine which balance to update
    const currentBalance = balanceType === 'bonus' ? user.bonusBalance : user.mainBalance
    let newBalance = currentBalance

    if (type === 'credit') {
      newBalance += amount
    } else if (type === 'debit') {
      if (currentBalance < amount) {
        return NextResponse.json({ error: "Insufficient funds" }, { status: 400 })
      }
      newBalance -= amount
    }

    // Update the appropriate balance
    const updateData = balanceType === 'bonus'
      ? { bonusBalance: newBalance }
      : { mainBalance: newBalance }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    })

    return NextResponse.json({
      mainBalance: updatedUser.mainBalance,
      bonusBalance: updatedUser.bonusBalance,
      totalBalance: updatedUser.mainBalance + updatedUser.bonusBalance
    })

  } catch (error) {
    console.error("Failed to update balance:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


export const dynamic = "force-dynamic";
