import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

export function auth() {
  const cookieStore = cookies()
  const userId = cookieStore.get('userId')?.value ?? null

  return {
    userId,
    protect() {},
  }
}

export async function getUser() {
  const cookieStore = cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) return null
  return prisma.user.findUnique({ where: { id: userId } })
}
