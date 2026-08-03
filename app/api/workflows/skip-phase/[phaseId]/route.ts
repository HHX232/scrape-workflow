import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import { requestPhaseSkip } from '@/lib/workflow/skipSignals'
import { WorkflowExecutionStatus } from '@/types/workflow'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest, { params }: { params: { phaseId: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phaseId } = params

  const phase = await prisma.executionPhase.findUnique({
    where: { id: phaseId },
    include: { execution: true }
  })

  if (!phase) return NextResponse.json({ error: 'Phase not found' }, { status: 404 })
  if (phase.execution.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (phase.execution.status !== WorkflowExecutionStatus.RUNNING) {
    return NextResponse.json({ error: 'Execution is not running' }, { status: 400 })
  }

  requestPhaseSkip(phaseId)

  return NextResponse.json({ success: true })
}
