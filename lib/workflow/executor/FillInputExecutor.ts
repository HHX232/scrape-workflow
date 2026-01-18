import {ExecutionEnviroment} from '@/types/Enviroment'
import {FillInputTask} from '../task/Fill_Input'

export async function FillInputExecutor(enviroment: ExecutionEnviroment<typeof FillInputTask>): Promise<boolean> {
  try {
    const selector = enviroment.getInput('Selector')
    if (!selector) {
      enviroment.log.error('input -> Selector is not defined')
      return false
    }
    const value = enviroment.getInput('Selector')
    if (!value) {
      enviroment.log.error('input -> value is not defined')
      return false
    }
    await enviroment.getPage()!.type(selector, value)
    return true
  } catch (error) {
    enviroment.log.error('Error getting page HTML')
    return false
  }
}
