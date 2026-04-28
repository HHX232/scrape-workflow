import {auth} from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import {ExecuteWorkflow} from '@/lib/workflow/ExecuteWorkflow'
import {FlowToExecutionPlan} from '@/lib/workflow/executionPlan'
import {TaskRegistry} from '@/lib/workflow/task/registry'
import {WorkflowExecutionStatus, WorkflowExecutionTrigger, WorkflowStatus} from '@/types/workflow'
import {NextRequest, NextResponse} from 'next/server'

export async function POST(req: NextRequest, {params}: {params: {id: string}}) {
  const {userId} = auth()
  if (!userId) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  let body: {flowDefinition?: string} = {}
  try {
    body = await req.json()
  } catch {}

  const workflow = await prisma.workflow.findUnique({where: {id: params.id, userId}}).catch(() => null)
  if (!workflow) return NextResponse.json({error: 'Workflow not found'}, {status: 404})

  let executionPlan: any
  let workflowDefinition = body.flowDefinition

  if (workflow.status === WorkflowStatus.PUBLISHED) {
    if (!workflow.executionPlan) {
      return NextResponse.json({error: 'No execution plan found for published workflow'}, {status: 400})
    }
    executionPlan = JSON.parse(workflow.executionPlan)
    workflowDefinition = workflow.definition
  } else {
    if (!body.flowDefinition) {
      return NextResponse.json({error: 'Flow definition is required'}, {status: 400})
    }
    const flow = JSON.parse(body.flowDefinition)
    const result = FlowToExecutionPlan(flow.nodes, flow.edges)
    if (result.error || !result.executionPlan) {
      return NextResponse.json({error: 'Failed to generate execution plan'}, {status: 400})
    }
    executionPlan = result.executionPlan
  }

  let execution: {id: string}
  try {
    execution = await prisma.workflowExecution.create({
      data: {
        workflowId: params.id,
        userId,
        status: WorkflowExecutionStatus.PENDING,
        startedAt: new Date(),
        trigger: WorkflowExecutionTrigger.MANUAL,
        definition: workflowDefinition,
        phases: {
          create: executionPlan.flatMap((phase: any) =>
            phase.nodes.flatMap((node: any) => ({
              userId,
              status: WorkflowExecutionStatus.CREATED,
              number: phase.phase,
              node: JSON.stringify(node),
              name: ((TaskRegistry as any)?.[node.data.type] as any)?.label || 'some name'
            }))
          )
        }
      },
      select: {id: true}
    })
  } catch (e: any) {
    console.error('[POST /api/workflows/[id]/run] prisma error', e)
    return NextResponse.json({error: 'Failed to create execution', detail: e?.message}, {status: 500})
  }

  ExecuteWorkflow(execution.id)
  return NextResponse.json({redirectUrl: `/workflow/runs/${params.id}/${execution.id}`})
}
