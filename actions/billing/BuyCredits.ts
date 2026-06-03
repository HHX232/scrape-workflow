'use server'

import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import { getCreditsPack, PackId } from '@/types/billing'

export async function BuyCredits(packId: PackId) {
  const { userId } = auth()
  if (!userId) throw new Error('unauthenticated')

  const pack = getCreditsPack(packId)
  if (!pack) throw new Error('Invalid pack')

  const purchase = await prisma.userPurchase.create({
    data: {
      userId,
      stripeId: `mock_${Date.now()}`,
      description: `${pack.name} — ${pack.label}`,
      amount: pack.price,
      currency: 'usd',
    },
  })

  await prisma.userBalance.upsert({
    where: { userId },
    update: { credits: { increment: pack.credits } },
    create: { userId, credits: pack.credits },
  })

  return { purchase, pack }
}
