import { ExecutionEnviroment } from '@/types/Enviroment'
import { AccumulateResultsTask } from '../task/AccumulateResultsTask'

/**
 * AccumulateResultsExecutor
 *
 * Appends the incoming Item (JSON object or plain string) to a persistent
 * array stored on the environment under `__accumulators[key]`.
 *
 * The array persists across loop iterations because the environment object
 * is shared for the entire workflow execution.
 */
export async function AccumulateResultsExecutor(
  enviroment: ExecutionEnviroment<typeof AccumulateResultsTask>
): Promise<boolean> {
  try {
    const item = enviroment.getInput('Item')
    if (item === undefined || item === null || item === '') {
      enviroment.log.error('input -> Item is not defined')
      return false
    }

    const key = enviroment.getInput('Accumulator Key') || 'default'

    // Use the raw environment to store cross-iteration state
    const loopEnv = enviroment as any
    if (!loopEnv.__accumulators) {
      loopEnv.__accumulators = {}
    }
    if (!Array.isArray(loopEnv.__accumulators[key])) {
      loopEnv.__accumulators[key] = []
    }

    // Try to parse item as JSON; if it fails, store as plain string
    let parsed: any
    try {
      parsed = JSON.parse(item)
    } catch {
      parsed = item
    }

    loopEnv.__accumulators[key].push(parsed)

    const results = JSON.stringify(loopEnv.__accumulators[key])
    enviroment.setOutput('Results', results)

    enviroment.log.info(
      `Accumulated item (key="${key}"): total ${loopEnv.__accumulators[key].length} items`
    )
    return true
  } catch (error: any) {
    enviroment.log.error(`AccumulateResults error: ${error?.message ?? error}`)
    return false
  }
}