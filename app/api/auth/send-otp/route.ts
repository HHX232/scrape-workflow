import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const code = String(Math.floor(1000 + Math.random() * 9000))
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

  await prisma.otpCode.create({ data: { email, code, expiresAt } })

  return NextResponse.json({ code })
}
