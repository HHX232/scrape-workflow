import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import { WorkflowExecutionStatus } from '@/types/workflow'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(_req: NextRequest, { params }: { params: { executionId: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { executionId } = params

  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId }
  })

  if (!execution) return NextResponse.json({ error: 'Execution not found' }, { status: 404 })
  if (execution.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (execution.status === WorkflowExecutionStatus.RUNNING) {
    return NextResponse.json({ error: 'Останови выполнение перед удалением' }, { status: 400 })
  }

  // Cascades to ExecutionPhase and ExecutionLog via the schema's onDelete: Cascade
  await prisma.workflowExecution.delete({ where: { id: executionId } })

  // lastRunId isn't a real FK, so a dangling reference wouldn't error — but
  // it would leave stale "last run" info showing on the workflow. Clear it
  // if this was the one being pointed to.
  await prisma.workflow
    .updateMany({
      where: { id: execution.workflowId, lastRunId: executionId },
      data: { lastRunId: null, lastRunStatus: null, lastRunAt: null }
    })
    .catch(() => {})

  return NextResponse.json({ success: true })
}
