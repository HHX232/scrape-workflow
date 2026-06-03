import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, code } = await req.json()

  if (!email || !code) {
    return NextResponse.json({ error: 'email and code are required' }, { status: 400 })
  }

  const otp = await prisma.otpCode.findFirst({
    where: { email, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  })

  if (!otp) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })

  const res = NextResponse.json({ ok: true, user })
  res.cookies.set('userId', user.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30 })
  return res
}
