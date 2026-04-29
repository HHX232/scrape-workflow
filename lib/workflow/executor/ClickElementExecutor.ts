import { ExecutionEnviroment } from '@/types/Enviroment'
import { ClickElementTask } from '../task/ClickElement'

export async function ClickElementExecutor(
  enviroment: ExecutionEnviroment<typeof ClickElementTask>
): Promise<boolean> {
  try {
    const selectorFromScroll = enviroment.getInput('Selector from Scroll') || ''
    const selector = selectorFromScroll || enviroment.getInput('Selector') || ''

    if (!selector) {
      enviroment.log.error('Не задан ни Selector, ни Selector from Scroll')
      return false
    }

    if (selectorFromScroll) {
      enviroment.log.info(`Используем селектор из Scroll: ${selector}`)
    }

    await enviroment.getPage()!.click(selector, { delay: 100 })
    return true
  } catch (error: any) {
    enviroment.log.info(`ClickElement: элемент не найден, продолжаем (${error?.message ?? error})`)
    return true
  }
}
