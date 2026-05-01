import { ExecutionEnviroment } from '@/types/Enviroment'
import { waitFor } from '@/lib/helper/waitFor'
import { WaitTask } from '../task/WaitTask'

export async function WaitExecutor(enviroment: ExecutionEnviroment<typeof WaitTask>): Promise<boolean> {
  try {
    const duration = enviroment.getInput('Duration (ms)')
    if (!duration) {
      enviroment.log.error('input -> Duration (ms) is not defined')
      return false
    }

    const ms = Number(duration)
    if (isNaN(ms) || ms < 0) {
      enviroment.log.error('input -> Duration (ms) must be a non-negative number')
      return false
    }

    await waitFor(ms)
    enviroment.log.info(`Waited ${ms}ms`)
    return true
  } catch (error) {
    enviroment.log.error('Error during wait')
    return false
  }
}
