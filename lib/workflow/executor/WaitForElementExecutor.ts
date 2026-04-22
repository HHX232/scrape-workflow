import { ExecutionEnviroment } from '@/types/Enviroment'
import { WaitForElementTask } from '../task/WaitForElement'

export async function WaitForElementExecutor(enviroment: ExecutionEnviroment<typeof WaitForElementTask>): Promise<boolean> {
  try {
    const selector = enviroment.getInput('Selector')
    if (!selector) {
      enviroment.log.error('input -> Selector is not defined')
      return false
    }
    const visibility = enviroment.getInput('Visibility')
    if (!visibility) {
      enviroment.log.error('input -> visibility is not defined')
      return false
    }

    await enviroment.getPage()!.waitForSelector(selector, {
      visible: visibility === 'visible',
      hidden: visibility === 'hidden'
    })
    enviroment.log.info(`Element ${selector} became ${visibility}`)
    return true
  } catch (error) {
    enviroment.log.error('Error clicking element')
    return false
  }
}
