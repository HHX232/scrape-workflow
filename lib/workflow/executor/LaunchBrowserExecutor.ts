import { ExecutionEnviroment } from '@/types/Enviroment'
import puppeteer from 'puppeteer'
import { LaunchBrowserTask } from '../task/LaunchBrowser'

export async function LaunchBrowserExecutor(
  enviroment: ExecutionEnviroment<typeof LaunchBrowserTask>
): Promise<boolean> {
  try {
    const websiteUrl = enviroment.getInput('Website Url')
    const browser = await puppeteer.launch({
      // Аня : показать открытие браузера
      headless: false
    })
    enviroment.log.info('Browser launched')
    enviroment.setBrowser(browser)
    const page = await browser.newPage()

    await page.goto(websiteUrl)
    enviroment.setPage(page)
    enviroment.log.info(`Opened page at: ${websiteUrl}`)

    return true
  } catch (error) {
    enviroment.log.error('Error launching browser')
    return false
  }
}
