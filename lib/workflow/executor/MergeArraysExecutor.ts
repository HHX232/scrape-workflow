import { ExecutionEnviroment } from '@/types/Enviroment'
import { MergeArraysTask } from '../task/MergeArraysTask'

const slotName = (prefix: string, i: number) => (i === 1 ? prefix : `${prefix} ${i}`)

export async function MergeArraysExecutor(
  enviroment: ExecutionEnviroment<typeof MergeArraysTask>
): Promise<boolean> {
  try {
    const env = enviroment as any
    const count: number = env.__dynamicInputCount ?? 1
    const merged: unknown[] = []

    for (let i = 1; i <= count; i++) {
      const raw = enviroment.getInput(slotName('Array', i) as never)
      if (!raw) continue
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          merged.push(...parsed)
        } else {
          merged.push(parsed)
        }
      } catch {
        merged.push(raw)
      }
    }

    enviroment.log.info(`MergeArrays: объединено ${merged.length} элементов из ${count} массивов`)
    enviroment.setOutput('Merged Array', JSON.stringify(merged))
    return true
  } catch (error: any) {
    enviroment.log.error(`MergeArrays error: ${error?.message ?? error}`)
    return false
  }
}
