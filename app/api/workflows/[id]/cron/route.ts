import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import parser from 'cron-parser'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { cron: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const interval = parser.parseExpression(body.cron, { utc: true })
    await prisma.workflow.update({
      where: { id: params.id, userId },
      data: { cron: body.cron, nextRunAt: interval.next().toDate() },
    })
  } catch (e: any) {
    console.error('[PUT /api/workflows/[id]/cron] error', e)
    return NextResponse.json({ error: 'Invalid cron expression', detail: e?.message }, { status: 400 })
  }

  revalidatePath('/workflows')
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.workflow.update({
      where: { id: params.id, userId },
      data: { cron: null, nextRunAt: null },
    })
  } catch (e: any) {
    console.error('[DELETE /api/workflows/[id]/cron] prisma error', e)
    return NextResponse.json({ error: 'Failed to remove schedule', detail: e?.message }, { status: 500 })
  }

  revalidatePath('/workflows')
  return NextResponse.json({ ok: true })
}
