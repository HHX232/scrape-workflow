import { ExecutionEnviroment } from '@/types/Enviroment'
import { ForEachTask } from '../task/ForEach'

export async function ForEachExecutor(
  enviroment: ExecutionEnviroment<typeof ForEachTask>
): Promise<boolean> {
  try {
    const loopEnv = enviroment as any
    const index: number = loopEnv.__forEachIndex ?? 0

    const itemsRaw = enviroment.getInput('Items')
    if (!itemsRaw) {
      enviroment.log.error('input -> Items is not defined')
      return false
    }

    let items: string[]
    try {
      items = JSON.parse(itemsRaw)
      if (!Array.isArray(items)) throw new Error('not an array')
    } catch {
      enviroment.log.error('input -> Items must be a valid JSON array of strings')
      return false
    }

    const currentItem = items[index]

    if (currentItem === undefined) {
      enviroment.log.error(`ForEach: index ${index} out of bounds (${items.length} items)`)
      return false
    }

    enviroment.log.info(`ForEach iteration ${index + 1}/${items.length}: ${currentItem}`)
    enviroment.setOutput('Current Item', currentItem)
    enviroment.setOutput('Index', String(index))

    return true
  } catch (error: any) {
    enviroment.log.error(`ForEach error: ${error?.message ?? error}`)
    return false
  }
}