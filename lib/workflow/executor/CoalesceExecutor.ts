import { ExecutionEnviroment } from '@/types/Enviroment'
import { CoalesceTask } from '../task/CoalesceTask'

function isEmpty(value: string): boolean {
  if (!value || value.trim() === '') return true
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.length === 0
  } catch {}
  return false
}

export async function CoalesceExecutor(
  enviroment: ExecutionEnviroment<typeof CoalesceTask>
): Promise<boolean> {
  try {
    const valueA = enviroment.getInput('Value A')
    const valueB = enviroment.getInput('Value B')

    const result = !isEmpty(valueA) ? valueA : valueB

    enviroment.log.info(`OR: Value A is ${isEmpty(valueA) ? 'empty' : 'non-empty'}, using ${!isEmpty(valueA) ? 'A' : 'B'}`)
    enviroment.setOutput('Result', result ?? '')
    return true
  } catch (error) {
    enviroment.log.error('Error in OR (Coalesce) block')
    return false
  }
}
