import { ExecutionEnviroment } from '@/types/Enviroment'
import { ForEachTask } from '../task/ForEach'

const slotName = (prefix: string, i: number) => (i === 1 ? prefix : `${prefix} ${i}`)

export async function ForEachExecutor(
  enviroment: ExecutionEnviroment<typeof ForEachTask>
): Promise<boolean> {
  try {
    const loopEnv = enviroment as any
    const index: number = loopEnv.__forEachIndex ?? 0
    const count: number = loopEnv.__dynamicInputCount ?? 1

    const primaryRaw = enviroment.getInput('Items' as any)
    if (!primaryRaw) {
      enviroment.log.error('input -> Items is not defined')
      return false
    }

    let primaryItems: unknown[]
    try {
      primaryItems = JSON.parse(primaryRaw)
      if (!Array.isArray(primaryItems)) throw new Error('not an array')
    } catch {
      enviroment.log.error('Items must be a valid JSON array')
      return false
    }

    const currentItem = primaryItems[index]
    if (currentItem === undefined) {
      enviroment.log.error(`ForEach: index ${index} out of bounds (${primaryItems.length} items)`)
      return false
    }

    enviroment.log.info(`ForEach iteration ${index + 1}/${primaryItems.length}`)
    enviroment.setOutput('Current Item' as any, String(currentItem))
    enviroment.setOutput('Index' as any, String(index))

    for (let i = 2; i <= count; i++) {
      const raw = enviroment.getInput(slotName('Items', i) as any)
      if (!raw) continue
      try {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr) && arr[index] !== undefined) {
          enviroment.setOutput(slotName('Current Item', i) as any, String(arr[index]))
        }
      } catch {}
    }

    return true
  } catch (error: any) {
    enviroment.log.error(`ForEach error: ${error?.message ?? error}`)
    return false
  }
}
