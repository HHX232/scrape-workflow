import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import { WorkflowStatus } from '@/types/workflow'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { definition: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const workflow = await prisma.workflow.findUnique({ where: { id: params.id } }).catch(() => null)
  if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  if (workflow.status !== WorkflowStatus.DRAFT) {
    return NextResponse.json({ error: 'Workflow is not in draft state' }, { status: 400 })
  }

  try {
    await prisma.workflow.update({
      data: { definition: body.definition },
      where: { id: params.id, userId },
    })
  } catch (e: any) {
    console.error('[PATCH /api/workflows/[id]] prisma error', e)
    return NextResponse.json({ error: 'Failed to update workflow', detail: e?.message }, { status: 500 })
  }

  revalidatePath('/workflows')
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.workflow.delete({ where: { id: params.id, userId } })
  } catch (e: any) {
    console.error('[DELETE /api/workflows/[id]] prisma error', e)
    return NextResponse.json({ error: 'Failed to delete workflow', detail: e?.message }, { status: 500 })
  }

  revalidatePath('/workflows')
  return NextResponse.json({ ok: true })
}
