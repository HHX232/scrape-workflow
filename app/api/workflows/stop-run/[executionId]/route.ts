import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import { ExecutionStatus, WorkflowExecutionStatus } from '@/types/workflow'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest, { params }: { params: { executionId: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { executionId } = params

  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId },
    include: { phases: { where: { status: ExecutionStatus.RUNNING }, take: 1 } }
  })

  if (!execution) return NextResponse.json({ error: 'Execution not found' }, { status: 404 })
  if (execution.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (execution.status !== WorkflowExecutionStatus.RUNNING) {
    return NextResponse.json({ error: 'Execution is not running' }, { status: 400 })
  }

  const runningPhase = execution.phases[0]

  await prisma.$transaction(async (tx) => {
    await tx.workflowExecution.update({
      where: { id: executionId },
      data: { status: WorkflowExecutionStatus.CANCELLED }
    })

    if (runningPhase) {
      await tx.executionPhase.update({
        where: { id: runningPhase.id },
        data: { status: ExecutionStatus.FAILED, completedAt: new Date() }
      })
      await tx.executionLog.create({
        data: {
          logLevel: 'error',
          message: 'Execution manually stopped by user',
          executionPhaseId: runningPhase.id
        }
      })
    }
  })

  return NextResponse.json({ success: true })
}
