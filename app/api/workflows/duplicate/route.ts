import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import { duplicateWorkflowSchema } from '@/schema/workflow'
import { WorkflowStatus } from '@/types/workflow'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { success, data } = duplicateWorkflowSchema.safeParse(body)
  if (!success) return NextResponse.json({ error: 'Invalid form data' }, { status: 422 })

  const source = await prisma.workflow.findUnique({ where: { id: data.workflowId, userId } }).catch(() => null)
  if (!source) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })

  try {
    await prisma.workflow.create({
      data: {
        name: data.name,
        userId,
        description: data.description,
        status: WorkflowStatus.DRAFT,
        definition: source.definition,
      },
    })
  } catch (e: any) {
    console.error('[POST /api/workflows/duplicate] prisma error', e)
    return NextResponse.json({ error: 'Failed to duplicate workflow', detail: e?.message }, { status: 500 })
  }

  revalidatePath('/workflows')
  return NextResponse.json({ ok: true })
}
