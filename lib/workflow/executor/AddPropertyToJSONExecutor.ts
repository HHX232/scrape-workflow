import { ExecutionEnviroment } from '@/types/Enviroment'
import { AddPropertyToJSONTask } from '../task/AddPropertyToJSON'

export async function AddPropertyToJSONExecutor(enviroment: ExecutionEnviroment<typeof AddPropertyToJSONTask>): Promise<boolean> {
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
    const value = enviroment.getInput('Property value')
    if (!value) {
      enviroment.log.error('input -> value is not defined')
      return false
    }

    const parsedJson = JSON.parse(json)
    parsedJson[name] = value
   
    enviroment.setOutput('Update JSON', JSON.stringify(parsedJson))
    return true
  } catch (error) {
    enviroment.log.error('Error reading property from JSON')
    return false
  }
}
