// Лёгкий счётчик живых Chromium-инстансов, запущенных ЭТИМ Node-процессом
// через puppeteer. Не системный (не ps aux) — считает только то, что открыл
// сам воркфлоу-движок, поэтому не может спутать браузер пользователя с чужим.
// Нужен для проверки, что LaunchBrowserExecutor не течёт по памяти между
// итерациями ForEach.
declare global {
  var __openBrowserCount: number | undefined
}

if (globalThis.__openBrowserCount === undefined) {
  globalThis.__openBrowserCount = 0
}

export function trackBrowserOpened(context: string) {
  globalThis.__openBrowserCount = (globalThis.__openBrowserCount ?? 0) + 1
  console.log(`[BrowserTracker] Открыт браузер (${context}). Сейчас открыто: ${globalThis.__openBrowserCount}`)
}

export function trackBrowserClosed(context: string) {
  globalThis.__openBrowserCount = Math.max(0, (globalThis.__openBrowserCount ?? 0) - 1)
  console.log(`[BrowserTracker] Закрыт браузер (${context}). Сейчас открыто: ${globalThis.__openBrowserCount}`)
}

export function getOpenBrowserCount(): number {
  return globalThis.__openBrowserCount ?? 0
}
