import { ExecutionEnviroment } from '@/types/Enviroment'
import { ReadPropertyFromJSONTask } from '../task/ReadPropertyFromJSON'

export async function ReadPropertyFromJSONExecutor(enviroment: ExecutionEnviroment<typeof ReadPropertyFromJSONTask>): Promise<boolean> {
  try {
    const json = enviroment.getInput('JSON')
    if (!json) {
      enviroment.log.error('input -> JSON is not defined')
      return false
    }
    const name = enviroment.getInput('Property name')
    if (!name) {
      enviroment.log.error('input -> name is not defined')
      return false
    }

    const parsedJson = JSON.parse(json)
    const propertyValue = parsedJson?.[name]
    if(propertyValue === undefined) {
      enviroment.log.error('Property not found')
      return false
    }
    enviroment.setOutput('Property value', propertyValue)
    return true
  } catch (error) {
    enviroment.log.error('Error reading property from JSON')
    return false
  }
}
