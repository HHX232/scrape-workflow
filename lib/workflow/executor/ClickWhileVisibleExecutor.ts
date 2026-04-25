import { ExecutionEnviroment } from '@/types/Enviroment'
import { ClickWhileVisibleTask } from '../task/ClickWhileVisibleTask'

export async function ClickWhileVisibleExecutor(
  enviroment: ExecutionEnviroment<typeof ClickWhileVisibleTask>
): Promise<boolean> {
  try {
    const page = enviroment.getPage()
    if (!page) {
      enviroment.log.error('Web page is not available')
      return false
    }

    const selector = enviroment.getInput('Selector') || ''
    const buttonText = enviroment.getInput('Button Text') || ''
    const maxClicks = Math.max(1, parseInt(enviroment.getInput('Max Clicks') || '1000', 10))
    const waitMs = Math.max(0, parseInt(enviroment.getInput('Wait Ms') || '500', 10))

    if (!selector && !buttonText) {
      enviroment.log.error('Укажите Selector или Button Text')
      return false
    }

    let clicks = 0

    for (let i = 0; i < maxClicks; i++) {
      let clicked = false

      // 1. Попытка по CSS-селектору
      if (selector) {
        try {
          const el = await page.$(selector)
          if (el) {
            if (buttonText) {
              // Проверяем текст перед кликом
              const text = await el.evaluate((node: Element) => node.textContent ?? '')
              if (text.trim().includes(buttonText)) {
                await el.click()
                clicked = true
              }
              // Селектор нашёл элемент, но текст не совпал — идём к text-поиску
            } else {
              await el.click()
              clicked = true
            }
          }
        } catch {
          // элемент мог стать stale — пробуем text-fallback
        }
      }

      // 2. Fallback: поиск по тексту во всех кликабельных элементах
      if (!clicked && buttonText) {
        clicked = await page.evaluate((text: string) => {
          const candidates = document.querySelectorAll('a, button, [role="button"], span, div')
          for (const el of Array.from(candidates)) {
            if ((el.textContent ?? '').trim().includes(text)) {
              ;(el as HTMLElement).click()
              return true
            }
          }
          return false
        }, buttonText)
      }

      if (!clicked) {
        enviroment.log.info(`Кнопка не найдена после ${clicks} кликов — останавливаемся`)
        break
      }

      clicks++
      await new Promise<void>(resolve => setTimeout(resolve, waitMs))
    }

    if (clicks >= maxClicks) {
      enviroment.log.info(`Достигнут лимит кликов (${maxClicks})`)
    }

    enviroment.log.info(`ClickWhileVisible: кликнули ${clicks} раз`)
    enviroment.setOutput('Clicks Performed', String(clicks))
    return true
  } catch (error: any) {
    enviroment.log.error(`ClickWhileVisible error: ${error?.message ?? error}`)
    return false
  }
}
