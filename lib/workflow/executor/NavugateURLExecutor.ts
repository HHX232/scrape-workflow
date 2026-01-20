import { ExecutionEnviroment } from '@/types/Enviroment'
import { NavigateUrlTask } from '../task/NavigateUrl'

export async function NavigateUrlExecutor(enviroment: ExecutionEnviroment<typeof NavigateUrlTask>): Promise<boolean> {
  try {
    const url = enviroment.getInput('URL')
    if (!url) {
      enviroment.log.error('input -> URL is not defined')
      return false
    }

    await enviroment.getPage()?.goto(url)
    enviroment.log.info('Navigated to URL' + url)
    return true
  } catch (error) {
    enviroment.log.error('Error navigating to URL')
    return false
  }
}
