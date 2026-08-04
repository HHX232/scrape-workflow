import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import { WorkflowExecutionStatus } from '@/types/workflow'
import { NextResponse } from 'next/server'

const DB_TIMEOUT_MS = 15000

// Общая проверка для всех "ручное вмешательство в зависший этап" роутов:
// пользователь авторизован, владеет этим execution, и он реально ещё RUNNING.
//
// Эти кнопки существуют именно чтобы спасти зависший прогон — если сама БД
// тоже не отвечает, запрос не должен повиснуть так же, как экзекьютор,
// который мы пытаемся прервать. Ограничиваем ожидание жёстким таймаутом,
// чтобы пользователь ГАРАНТИРОВАННО получил ответ (пусть даже "БД не
// отвечает"), а не бесконечный спиннер.
export async function guardPhaseSignal(
  phaseId: string
): Promise<{ ok: true; phaseName: string } | { ok: false; response: NextResponse }> {
  const { userId } = auth()
  if (!userId) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const findPhase = () =>
    prisma.executionPhase.findUnique({
      where: { id: phaseId },
      include: { execution: true }
    })

  let phase: Awaited<ReturnType<typeof findPhase>>
  try {
    phase = await Promise.race([
      findPhase(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB timeout')), DB_TIMEOUT_MS)
      )
    ])
  } catch {
    console.log(`[phaseSignalGuard] DB did not respond within ${DB_TIMEOUT_MS}ms for phase ${phaseId}`)
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Database is not responding — try again, or use Stop execution instead' },
        { status: 504 }
      )
    }
  }

  if (!phase) {
    return { ok: false, response: NextResponse.json({ error: 'Phase not found' }, { status: 404 }) }
  }
  if (phase.execution.userId !== userId) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  if (phase.execution.status !== WorkflowExecutionStatus.RUNNING) {
    return { ok: false, response: NextResponse.json({ error: 'Execution is not running' }, { status: 400 }) }
  }

  return { ok: true, phaseName: phase.name }
}
