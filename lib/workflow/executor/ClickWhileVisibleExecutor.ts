import {ExecutionEnviroment} from '@/types/Enviroment'
import {ClickWhileVisibleTask} from '../task/ClickWhileVisibleTask'

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`op timeout ${ms}ms`)), ms))
  ])

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

    // Жёсткий дедлайн: не более 120 секунд на весь шаг
    const DEADLINE_MS = 120_000
    const OP_TIMEOUT_MS = 8_000
    const deadline = Date.now() + DEADLINE_MS

    if (!selector && !buttonText) {
      enviroment.log.error('Укажите Selector или Button Text')
      return false
    }

    let clicks = 0

    for (let i = 0; i < maxClicks; i++) {
      if (Date.now() >= deadline) {
        enviroment.log.info(`ClickWhileVisible: достигнут лимит времени (${DEADLINE_MS / 1000}с)`)
        break
      }

      let clicked = false

      // 1. Попытка по CSS-селектору
      if (selector) {
        try {
          const el = await withTimeout(page.$(selector), OP_TIMEOUT_MS)
          if (el) {
            if (buttonText) {
              const text = await withTimeout(
                el.evaluate((node: Element) => node.textContent ?? ''),
                OP_TIMEOUT_MS
              )
              if (text.trim().includes(buttonText)) {
                await withTimeout(el.click(), OP_TIMEOUT_MS)
                clicked = true
              }
            } else {
              await withTimeout(el.click(), OP_TIMEOUT_MS)
              clicked = true
            }
          }
        } catch {
          // stale element или timeout — пробуем text-fallback
        }
      }

      // 2. Fallback: поиск по тексту во всех кликабельных элементах
      if (!clicked && buttonText) {
        try {
          clicked = await withTimeout(
            page.evaluate((text: string) => {
              const candidates = document.querySelectorAll('a, button, [role="button"], span, div')
              for (const el of Array.from(candidates)) {
                if ((el.textContent ?? '').trim().includes(text)) {
                  ;(el as HTMLElement).click()
                  return true
                }
              }
              return false
            }, buttonText),
            OP_TIMEOUT_MS
          )
        } catch {
          // timeout в evaluate — считаем что кнопка не найдена
        }
      }

      if (!clicked) {
        enviroment.log.info(`Кнопка не найдена после ${clicks} кликов — останавливаемся`)
        break
      }

      clicks++
      await new Promise<void>((resolve) => setTimeout(resolve, waitMs))
    }

    if (clicks >= maxClicks) {
      enviroment.log.info(`Достигнут лимит кликов (${maxClicks})`)
    }

    enviroment.log.info(`ClickWhileVisible: кликнули ${clicks} раз`)
    enviroment.setOutput('Clicks Performed', String(clicks))
    return true
  } catch (error: any) {
    enviroment.log.error(`ClickWhileVisible error (продолжаем): ${error?.message ?? error}`)
    return true
  }
}
