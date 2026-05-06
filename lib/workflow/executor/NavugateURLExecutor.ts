import { ExecutionEnviroment } from '@/types/Enviroment'
import { NavigateUrlTask } from '../task/NavigateUrl'

export async function NavigateUrlExecutor(enviroment: ExecutionEnviroment<typeof NavigateUrlTask>): Promise<boolean> {
  try {
    const url = enviroment.getInput('URL')
    const softFail = enviroment.getInput('Soft fail') === 'true'

    if (!url) {
      enviroment.log.error('input -> URL is not defined')
      if (softFail) { enviroment.setOutput('Success', 'false'); return true }
      return false
    }

    try {
      await enviroment.getPage()?.goto(url)
      enviroment.log.info('Navigated to URL: ' + url)
      enviroment.setOutput('Success', 'true')
      return true
    } catch (navError) {
      enviroment.log.error('Error navigating to URL: ' + url)
      if (softFail) { enviroment.setOutput('Success', 'false'); return true }
      return false
    }
  } catch (error) {
    enviroment.log.error('Unexpected error in NavigateUrl')
    return false
  }
}
