// In-memory (per server-процесс) сигнал "пропустить этот этап прямо сейчас".
// Не через БД: сигнал нужен только внутри ТОГО ЖЕ Node-процесса, где крутится
// ExecuteWorkflow — лишний round-trip к удалённой БД тут не нужен (и мы их
// специально сокращали в другом месте).
//
// Ограничение: не переживает рестарт сервера и не работает, если execute
// и API-роут скипа оказались на разных инстансах при горизонтальном
// масштабировании — для одного процесса (next dev / next start) этого хватает.
declare global {
  var __skipPhaseRequests: Set<string> | undefined
}

const skipRequests = globalThis.__skipPhaseRequests ?? new Set<string>()
globalThis.__skipPhaseRequests = skipRequests

export function requestPhaseSkip(phaseId: string) {
  skipRequests.add(phaseId)
}

export function consumeSkipRequest(phaseId: string): boolean {
  if (skipRequests.has(phaseId)) {
    skipRequests.delete(phaseId)
    return true
  }
  return false
}
