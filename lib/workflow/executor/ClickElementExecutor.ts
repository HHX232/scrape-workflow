import {ExecutionEnviroment} from '@/types/Enviroment'
import {ClickElementTask} from '../task/ClickElement'

export async function ClickElementExecutor(enviroment: ExecutionEnviroment<typeof ClickElementTask>): Promise<boolean> {
  try {
    const selector = enviroment.getInput('Selector')
    if (!selector) {
      enviroment.log.error('input -> Selector is not defined')
      return false
    }

    await enviroment.getPage()!.click(selector, {delay: 100})
    return true
  } catch (error) {
    enviroment.log.error('Error clicking element')
    return false
  }
}
