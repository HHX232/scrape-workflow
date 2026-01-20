import {ExecutionEnviroment} from '@/types/Enviroment'
import {ScrollToElementTask} from '../task/ScrollToElement'

export async function ScrollToElementExecutor(
  enviroment: ExecutionEnviroment<typeof ScrollToElementTask>
): Promise<boolean> {
  try {
    const selector = enviroment.getInput('Selector')
    if (!selector) {
      enviroment.log.error('input -> Selector is not defined')
      return false
    }

    await enviroment.getPage()!.evaluate((selector) => {
      const element = document.querySelector(selector)
      if (!element) {
        throw new Error('element not found')
      }
      const top = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({top})
    }, selector)

    return true
  } catch (error) {
    enviroment.log.error('Error clicking element')
    return false
  }
}
