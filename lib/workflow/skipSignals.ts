// In-memory (per server-процесс) сигналы ручного управления зависшим этапом.
// Не через БД: сигнал нужен только внутри ТОГО ЖЕ Node-процесса, где крутится
// ExecuteWorkflow — лишний round-trip к удалённой БД тут не нужен (и мы их
// специально сокращали в другом месте).
//
// Ограничение: не переживает рестарт сервера и не работает, если execute
// и API-роут скипа оказались на разных инстансах при горизонтальном
// масштабировании — для одного процесса (next dev / next start) этого хватает.
export type PhaseSignal = 'skip' | 'restart' | 'skipIteration'

declare global {
  var __phaseSignals: Map<string, PhaseSignal> | undefined
}

const phaseSignals = globalThis.__phaseSignals ?? new Map<string, PhaseSignal>()
globalThis.__phaseSignals = phaseSignals

export function requestPhaseSignal(phaseId: string, signal: PhaseSignal) {
  phaseSignals.set(phaseId, signal)
}

export function consumePhaseSignal(phaseId: string): PhaseSignal | null {
  const signal = phaseSignals.get(phaseId)
  if (!signal) return null
  phaseSignals.delete(phaseId)
  return signal
}
