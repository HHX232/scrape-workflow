import { ExecutionEnviroment } from '@/types/Enviroment'
import { MergeTextsToJsonTask } from '../task/MergeTextsToJsonTask'

export async function MergeTextsToJsonExecutor(
  enviroment: ExecutionEnviroment<typeof MergeTextsToJsonTask>
): Promise<boolean> {
  try {
    const schemaRaw = enviroment.getInput('Schema')
    if (!schemaRaw) {
      enviroment.log.error('input -> Schema is not defined')
      return false
    }

    let schema: Record<string, string>
    try {
      schema = JSON.parse(schemaRaw)
      if (typeof schema !== 'object' || Array.isArray(schema)) throw new Error()
    } catch {
      enviroment.log.error('input -> Schema must be a valid JSON object mapping outputKey → inputName')
      return false
    }

    const result: Record<string, any> = {}

    for (const [outputKey, inputName] of Object.entries(schema)) {
      const value = enviroment.getInput(inputName as any)
      if (value === undefined || value === null) {
        enviroment.log.info(`Schema key "${outputKey}" → input "${inputName}" is empty/missing, using null`)
        result[outputKey] = null
        continue
      }
      // Try to parse as JSON (e.g. arrays/objects); fall back to plain string
      try {
        result[outputKey] = JSON.parse(value)
      } catch {
        result[outputKey] = value
      }
    }

    enviroment.setOutput('JSON Object', JSON.stringify(result))
    enviroment.log.info(`MergeTextsToJson: produced object with keys [${Object.keys(result).join(', ')}]`)
    return true
  } catch (error: any) {
    enviroment.log.error(`MergeTextsToJson error: ${error?.message ?? error}`)
    return false
  }
}