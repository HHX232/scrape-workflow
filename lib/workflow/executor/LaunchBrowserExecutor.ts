import { ExecutionEnviroment } from '@/types/Enviroment'
import puppeteer from 'puppeteer'
import { LaunchBrowserTask } from '../task/LaunchBrowser'

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
    
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        // '--proxy-server=http://brd.superproxy.io:33335',  // ЗАКОММЕНТИРОВАН ПРОКСИ
        '--ignore-certificate-errors',
      ]
    })
    
    enviroment.log.info('Browser launched')
    enviroment.setBrowser(browser)
    
    const page = await browser.newPage()
    
    // ЗАКОММЕНТИРОВАНА АУТЕНТИФИКАЦИЯ ПРОКСИ
    // await page.authenticate({
    //   username: 'brd-customer-hl_71fd2915-zone-residential_proxy1',
    //   password: 'dbrnwpt7uwj7'
    // })
    
    // await page.setViewport({ width: 1920, height: 1080 })
    
    await page.goto(validUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000
    })
    
    enviroment.setPage(page)
    enviroment.log.info(`Successfully opened page at: ${validUrl}`)

    return true
  } catch (error) {
    enviroment.log.error(`Error launching browser: ${error}`)
    return false
  }
}