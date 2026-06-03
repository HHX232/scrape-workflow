import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const userId = cookies().get('userId')?.value
  if (!userId) return NextResponse.json(null)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  return NextResponse.json(user ?? null)
}
