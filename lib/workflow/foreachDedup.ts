// "Костыль"-защита от дублирования для паттерна: вложенный ForEach читает
// Items из ноды (обычно AccumulateResults), которая продолжает пополняться
// на каждом проходе ВНЕШНЕГО цикла. Без этого при повторном входе во
// вложенный ForEach его Items-список уже вырос — и он заново обрабатывает
// ВСЕ элементы, включая уже обработанные в прошлый раз (квадратичное
// дублирование при N внешних итераций).
//
// Трекаем по ЗНАЧЕНИЮ элемента (не по индексу — индекс в растущем массиве не
// стабилен), в рамках одного выполнения воркфлоу, отдельно на каждый узел
// ForEach. Побочный эффект (тоже полезный): если один и тот же элемент
// встретится в СОВЕРШЕННО РАЗНЫХ списках этого узла (например тот же товар
// в двух подкатегориях), второй раз он тоже не обработается.
export type SeenItemsMap = Map<string, Set<string>>

export function getSeenItemsMap(enviroment: object): SeenItemsMap {
  const store = enviroment as { __seenForEachItems?: SeenItemsMap }
  if (!store.__seenForEachItems) {
    store.__seenForEachItems = new Map()
  }
  return store.__seenForEachItems
}

// Возвращает только ещё не виденные элементы вместе с их индексом в
// ИСХОДНОМ (полном) массиве — индекс нужен, потому что ForEachExecutor сам
// заново читает полный Items и берёт элемент по __forEachIndex.
export function filterUnseenItems(
  seenMap: SeenItemsMap,
  nodeId: string,
  items: string[]
): {value: string; index: number}[] {
  let seen = seenMap.get(nodeId)
  if (!seen) {
    seen = new Set()
    seenMap.set(nodeId, seen)
  }
  const unseen: {value: string; index: number}[] = []
  items.forEach((value, index) => {
    if (!seen!.has(value)) {
      seen!.add(value)
      unseen.push({value, index})
    }
  })
  return unseen
}
