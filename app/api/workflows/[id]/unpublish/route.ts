import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import { WorkflowStatus } from '@/types/workflow'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workflow = await prisma.workflow.findUnique({ where: { id: params.id, userId } }).catch(() => null)
  if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  if (workflow.status !== WorkflowStatus.PUBLISHED) {
    return NextResponse.json({ error: 'Workflow is not published' }, { status: 400 })
  }

  try {
    await prisma.workflow.update({
      where: { id: params.id, userId },
      data: { status: WorkflowStatus.DRAFT, executionPlan: null, creditsCost: 0 },
    })
  } catch (e: any) {
    console.error('[POST /api/workflows/[id]/unpublish] prisma error', e)
    return NextResponse.json({ error: 'Failed to unpublish workflow', detail: e?.message }, { status: 500 })
  }

  revalidatePath(`/workflow/editor/${params.id}`)
  return NextResponse.json({ ok: true })
}
