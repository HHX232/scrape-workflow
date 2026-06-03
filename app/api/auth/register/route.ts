import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, email, avatar, code } = await req.json()

  if (!name || !email || !code) {
    return NextResponse.json({ error: 'name, email and code are required' }, { status: 400 })
  }

  const otp = await prisma.otpCode.findFirst({
    where: { email, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  })

  if (!otp) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const user = await prisma.user.create({ data: { name, email, avatar: avatar || null } })

  const balance = await prisma.userBalance.findUnique({ where: { userId: user.id } })
  if (!balance) {
    await prisma.userBalance.create({ data: { userId: user.id, credits: 100000000 } })
  }

  const res = NextResponse.json({ ok: true, user })
  res.cookies.set('userId', user.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30 })
  return res
}
