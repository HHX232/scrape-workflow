import { ExecutionEnviroment } from '@/types/Enviroment'
import { ScrollToElementTask } from '../task/ScrollToElement'

const DATA_ATTR = 'data-wf-scroll-target'
const FOUND_SELECTOR = `[${DATA_ATTR}]`

export async function ScrollToElementExecutor(
  enviroment: ExecutionEnviroment<typeof ScrollToElementTask>
): Promise<boolean> {
  try {
    const page = enviroment.getPage()!
    const selector = enviroment.getInput('Selector') || ''
    const buttonText = enviroment.getInput('Button Text') || ''

    if (!selector && !buttonText) {
      enviroment.log.error('Укажите Selector или Button Text')
      return false
    }

    let resolved = selector

    // 1. Попытка по CSS-селектору
    if (selector) {
      const found = await page.evaluate((sel: string) => {
        const el = document.querySelector(sel)
        if (!el) return false
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return true
      }, selector)

      if (found) {
        enviroment.setOutput('Found Selector', selector)
        return true
      }

      enviroment.log.info(`Selector не нашёл элемент — пробуем по тексту`)
    }

    // 2. Поиск по тексту
    if (buttonText) {
      // Снимаем атрибут с предыдущего элемента если был
      await page.evaluate((attr: string) => {
        document.querySelector(`[${attr}]`)?.removeAttribute(attr)
      }, DATA_ATTR).catch(() => {})

      const found = await page.evaluate(
        ({ text, attr }: { text: string; attr: string }) => {
          const candidates = document.querySelectorAll('a, button, [role="button"], span, div, p')
          for (const el of Array.from(candidates)) {
            if ((el.textContent ?? '').trim().includes(text)) {
              el.setAttribute(attr, '1')
              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              return true
            }
          }
          return false
        },
        { text: buttonText, attr: DATA_ATTR }
      )

      if (!found) {
        enviroment.log.error(`Элемент с текстом "${buttonText}" не найден`)
        return false
      }

      resolved = FOUND_SELECTOR
      enviroment.log.info(`Найден по тексту "${buttonText}" → ${resolved}`)
    }

    enviroment.setOutput('Found Selector', resolved)
    return true
  } catch (error: any) {
    enviroment.log.error(`ScrollToElement error: ${error?.message ?? error}`)
    return false
  }
}
