'use server'

import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import { WorkflowExecutionStatus } from '@/types/workflow'

export async function cancelWorkflowExecution(executionId: string) {
  const { userId } = auth()
  if (!userId) throw new Error('Unauthorized')

  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId }
  })

  if (!execution) throw new Error('Execution not found')
  if (execution.userId !== userId) throw new Error('Unauthorized')
  if (execution.status !== WorkflowExecutionStatus.RUNNING) {
    throw new Error('Execution is not running')
  }

  await prisma.workflowExecution.update({
    where: { id: executionId },
    data: { status: WorkflowExecutionStatus.CANCELLED }
  })
}
