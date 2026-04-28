import { auth } from '@/components/hooks/auth'
import { CalculateWorkflowCost } from '@/lib/helpers'
import prisma from '@/lib/prisma'
import { FlowToExecutionPlan } from '@/lib/workflow/executionPlan'
import { WorkflowStatus } from '@/types/workflow'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { flowDefinition: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const workflow = await prisma.workflow.findUnique({ where: { id: params.id, userId } }).catch(() => null)
  if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  if (workflow.status !== WorkflowStatus.DRAFT) {
    return NextResponse.json({ error: 'Workflow is not a draft' }, { status: 400 })
  }

  const flow = JSON.parse(body.flowDefinition)
  const result = FlowToExecutionPlan(flow.nodes, flow.edges)
  if (result.error || !result.executionPlan) {
    return NextResponse.json({ error: 'Flow definition not valid' }, { status: 400 })
  }

  const creditsCost = CalculateWorkflowCost(flow.nodes)
  try {
    await prisma.workflow.update({
      where: { id: params.id, userId },
      data: {
        definition: body.flowDefinition,
        executionPlan: JSON.stringify(result.executionPlan),
        creditsCost,
        status: WorkflowStatus.PUBLISHED,
      },
    })
  } catch (e: any) {
    console.error('[POST /api/workflows/[id]/publish] prisma error', e)
    return NextResponse.json({ error: 'Failed to publish workflow', detail: e?.message }, { status: 500 })
  }

  revalidatePath(`/workflow/editor/${params.id}`)
  return NextResponse.json({ ok: true })
}
