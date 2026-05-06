import { ExecutionEnviroment } from '@/types/Enviroment'
import { CoalesceTask } from '../task/CoalesceTask'
import * as cheerio from 'cheerio'

function isEmpty(value: string): boolean {
  if (!value || value.trim() === '') return true
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.length === 0
  } catch {}
  return false
}

export async function CoalesceExecutor(
  enviroment: ExecutionEnviroment<typeof CoalesceTask>
): Promise<boolean> {
  try {
    const valueA = enviroment.getInput('Value A')
    const valueB = enviroment.getInput('Value B')
    const selector = enviroment.getInput('Selector')
    const pageSelector = enviroment.getInput('Page selector')

    let useA: boolean

    if (pageSelector && pageSelector.trim()) {
      const page = enviroment.getPage()
      if (!page) {
        enviroment.log.error('OR: Page selector задан, но браузер недоступен')
        return false
      }
      const html = await page.content()
      const $ = cheerio.load(html)
      const found = $(pageSelector.trim()).length > 0
      useA = found
      enviroment.log.info(
        `OR: page selector "${pageSelector}" ${found ? 'найден' : 'не найден'} в Web page → используем ${found ? 'A' : 'B'}`
      )
    } else if (selector && selector.trim()) {
      const $ = cheerio.load(valueA ?? '')
      const found = $(selector.trim()).length > 0
      useA = found
      enviroment.log.info(
        `OR: selector "${selector}" ${found ? 'найден' : 'не найден'} в Value A → используем ${found ? 'A' : 'B'}`
      )
    } else {
      useA = !isEmpty(valueA)
      enviroment.log.info(`OR: Value A ${useA ? 'не пустой' : 'пустой'} → используем ${useA ? 'A' : 'B'}`)
    }

    enviroment.setOutput('Result', (useA ? valueA : valueB) ?? '')
    return true
  } catch (error) {
    enviroment.log.error('Error in OR (Coalesce) block')
    return false
  }
}
