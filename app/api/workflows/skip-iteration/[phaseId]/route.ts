import { guardPhaseSignal } from '@/lib/workflow/phaseSignalGuard'
import { requestPhaseSignal } from '@/lib/workflow/skipSignals'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest, { params }: { params: { phaseId: string } }) {
  const { phaseId } = params
  const guard = await guardPhaseSignal(phaseId)
  if (!guard.ok) return guard.response

  requestPhaseSignal(phaseId, 'skipIteration')
  console.log(`[skip-iteration] Requested for phase "${guard.phaseName}" (${phaseId})`)

  return NextResponse.json({ success: true })
}
