// Защита от "брошенных" попыток выполнения фазы (restart/skip/skipIteration
// не отменяют реальный in-flight вызов экзекьютора — JS не умеет force-
// cancel произвольный промис, он просто перестаёт ждать его). Если брошенная
// попытка всё же завершится ПОЗЖЕ новой (или после того как цикл ушёл на
// следующую итерацию того же узла), её запись в setOutput/setBrowser/setPage
// не должна перезаписывать то, что уже написала актуальная попытка.
//
// Механизм: у каждого узла свой счётчик поколений. Перед стартом попытки
// берём номер нового поколения; запись разрешена только пока это поколение
// всё ещё актуально (т.е. никто новее не стартовал для этого же узла).
export type AttemptGenerations = Map<string, number>

export function getGenerationsMap(enviroment: object): AttemptGenerations {
  const store = enviroment as { __attemptGenerations?: AttemptGenerations }
  if (!store.__attemptGenerations) {
    store.__attemptGenerations = new Map()
  }
  return store.__attemptGenerations
}

export function beginAttempt(generations: AttemptGenerations, nodeId: string): number {
  const next = (generations.get(nodeId) ?? 0) + 1
  generations.set(nodeId, next)
  return next
}

export function isCurrentAttempt(generations: AttemptGenerations, nodeId: string, generation: number): boolean {
  return generations.get(nodeId) === generation
}
