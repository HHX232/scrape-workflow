import { ExecutionEnviroment } from '@/types/Enviroment'
import { CoalesceTask } from '../task/CoalesceTask'
import * as cheerio from 'cheerio'

// Держим в синхроне с PLACEHOLDER в ExtractTextFromElementExecutor.ts — это
// его строка-заглушка "селектор ничего не нашёл", а не реальные данные.
// Без этой проверки OR видит непустую строку и берёт заглушку вместо того,
// чтобы переключиться на рабочий Value B (реальный баг: OR "выигрывал"
// плейсхолдером вместо валидного запасного значения).
const NOT_FOUND_PLACEHOLDER = 'ТЕКСТ НЕ НАЙДЕН'

function isEmpty(value: string): boolean {
  if (!value || value.trim() === '') return true
  if (value.trim() === NOT_FOUND_PLACEHOLDER) return true
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
    const separateOutputs = enviroment.getInput('Раздельные выходы' as never) === 'true'

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

    // Скрытый маркер для движка (не объявлен как настоящий output, не рисуется
    // в UI) — по нему ExecuteWorkflow определяет, какая ветка выбрана, чтобы
    // пропустить эксклюзивную часть невыбранной, не полагаясь на "пустое ли
    // значение" (значение само по себе может законно быть пустой строкой).
    ;(enviroment as any).setOutput('__branch', useA ? 'A' : 'B')

    if (separateOutputs) {
      enviroment.setOutput('Value Output A' as never, useA ? (valueA ?? '') : '')
      enviroment.setOutput('Value Output B' as never, !useA ? (valueB ?? '') : '')
      // Page Output A/B — BROWSER_INSTANCE, чисто структурные маркеры для
      // BFS движка (как и все BROWSER_INSTANCE outputs в этом приложении,
      // ни один executor их значение не пишет). Реальная страница всегда
      // идёт через enviroment.getPage()/setPage(), не через эти рёбра.
    } else {
      enviroment.setOutput('Result', (useA ? valueA : valueB) ?? '')
    }

    return true
  } catch (error) {
    enviroment.log.error('Error in OR (Coalesce) block')
    return false
  }
}
