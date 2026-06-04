import {ExecutionEnviroment} from '@/types/Enviroment'
import puppeteer from 'puppeteer'
import {LaunchBrowserTask} from '../task/LaunchBrowser'

const PROXIES = [
  '45.129.204.82:8000',
  '45.129.207.251:8000',
  '45.129.205.208:8000',
  '45.129.205.201:8000',
  '45.129.206.175:8000',
  '45.129.207.9:8000',
  '45.129.207.197:8000'
]

const PROXY_USER = 'wnd05Z'
const PROXY_PASS = '2j7N1A'

export async function LaunchBrowserExecutor(
  enviroment: ExecutionEnviroment<typeof LaunchBrowserTask>
): Promise<boolean> {
  try {
    const websiteUrl = enviroment.getInput('Website Url')

    if (!websiteUrl || websiteUrl.trim() === '') {
      enviroment.log.error('Website URL is empty or undefined')
      return false
    }

    let validUrl = websiteUrl.trim()
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl
      enviroment.log.info(`Protocol added to URL: ${validUrl}`)
    }

    try {
      new URL(validUrl)
    } catch (urlError) {
      enviroment.log.error(`Invalid URL format: ${validUrl}`)
      return false
    }

    const LAUNCH_ARGS_BASE = [
      '--ignore-certificate-errors',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]

    const navigatePage = async (page: any) => {
      try {
        await page.goto(validUrl, { waitUntil: 'networkidle2', timeout: 30000 })
      } catch (navError: any) {
        if (navError?.message?.includes('timeout') || navError?.name === 'TimeoutError') {
          enviroment.log.info('Page load timeout — продолжаем с доступным DOM')
        } else {
          throw navError
        }
      }
    }

    const proxy = PROXIES[Math.floor(Math.random() * PROXIES.length)]
    let browser: Awaited<ReturnType<typeof puppeteer.launch>>
    let page: Awaited<ReturnType<typeof browser.newPage>>

    const proxyBrowser = await puppeteer.launch({
      headless: true,
      protocolTimeout: 30000,
      args: [`--proxy-server=http://${proxy}`, ...LAUNCH_ARGS_BASE]
    })

    try {
      const proxyPage = await proxyBrowser.newPage()
      await proxyPage.authenticate({ username: PROXY_USER, password: PROXY_PASS })
      await navigatePage(proxyPage)
      browser = proxyBrowser
      page = proxyPage
      enviroment.log.info(`Using proxy: ${proxy}`)
    } catch (proxyErr: any) {
      enviroment.log.info(`Proxy unavailable (${proxyErr.message}), falling back to direct connection`)
      await proxyBrowser.close().catch(() => {})
      browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 30000,
        args: LAUNCH_ARGS_BASE
      })
      page = await browser.newPage()
      await navigatePage(page)
      enviroment.log.info('Direct connection used (no proxy)')
    }

    enviroment.setBrowser(browser)
    enviroment.setPage(page)
    enviroment.log.info(`Successfully opened page at: ${validUrl}`)

    return true
  } catch (error) {
    enviroment.log.error(`Error launching browser: ${error}`)
    return false
  }
}
