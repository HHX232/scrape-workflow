import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import { createFlowNode } from '@/lib/workflow/createFlowNode'
import { createWorkFlowSchema } from '@/schema/workflow'
import { AppNode } from '@/types/appNode'
import { TaskType } from '@/types/TaskType'
import { WorkflowStatus } from '@/types/workflow'
import { Edge } from '@xyflow/react'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('[POST /api/workflows/create] request received')

  let body: unknown
  try {
    body = await req.json()
    console.log('[POST /api/workflows/create] body:', JSON.stringify(body))
  } catch (e) {
    console.error('[POST /api/workflows/create] failed to parse body:', e)
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { success, data } = createWorkFlowSchema.safeParse(body)
  if (!success) {
    console.error('[POST /api/workflows/create] validation failed for body:', JSON.stringify(body))
    return NextResponse.json({ error: 'Invalid form data' }, { status: 422 })
  }
  console.log('[POST /api/workflows/create] validation ok, data:', JSON.stringify(data))

  const { userId } = auth()
  console.log('[POST /api/workflows/create] userId from cookie:', userId)
  if (!userId) {
    console.error('[POST /api/workflows/create] no userId in cookie')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const initialFlow: { nodes: AppNode[]; edges: Edge[] } = { nodes: [], edges: [] }
  initialFlow.nodes.push(createFlowNode(TaskType.LAUNCH_BROWSER))
  console.log('[POST /api/workflows/create] initialFlow nodes:', initialFlow.nodes.length)

  let workflow
  try {
    console.log('[POST /api/workflows/create] calling prisma.workflow.create...')
    workflow = await prisma.workflow.create({
      data: {
        userId,
        status: WorkflowStatus.DRAFT,
        definition: JSON.stringify(initialFlow),
        name: data.name,
        description: data.description || '',
      },
    })
    console.log('[POST /api/workflows/create] created workflow id:', workflow.id)
  } catch (e: any) {
    console.error(
      `[POST /api/workflows/create] prisma error | userId=${userId} name="${data.name}" | code=${e?.code} | msg=${e?.message} | meta=${JSON.stringify(e?.meta)}`
    )
    return NextResponse.json(
      { error: 'Failed to create workflow', detail: e?.message },
      { status: 500 }
    )
  }

  console.log('[POST /api/workflows/create] success, returning redirectUrl')
  return NextResponse.json({ redirectUrl: `/workflows/editor/${workflow.id}` }, { status: 201 })
}
