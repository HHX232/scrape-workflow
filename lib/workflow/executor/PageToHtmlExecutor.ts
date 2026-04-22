import { ExecutionEnviroment } from '@/types/Enviroment'
import { PageToHtmlTask } from '../task/PageToHtml'

export async function PageToHtmlExecutor(enviroment: ExecutionEnviroment<typeof PageToHtmlTask>): Promise<boolean> {
  try {
  const html = await enviroment.getPage()!.content()
  enviroment.setOutput('Html', html)
    return true
  } catch (error) {
    enviroment.log.error("Error getting page HTML")
    return false
  }
}
