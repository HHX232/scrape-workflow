import { ExecutionEnviroment } from '@/types/Enviroment'
import * as cheerio from 'cheerio'
import { ExtractLinksTask } from '../task/ExtractLinksTask'

export async function ExtractLinksExecutor(enviroment: ExecutionEnviroment<typeof ExtractLinksTask>): Promise<boolean> {
  try {
    const html = enviroment.getInput('Html')
    if (!html) {
      enviroment.log.error('input -> Html is not defined')
      return false
    }

    const selector = enviroment.getInput('Selector')
    if (!selector) {
      enviroment.log.error('input -> Selector is not defined')
      return false
    }

    const baseUrl = enviroment.getInput('Base URL') || ''

    const $ = cheerio.load(html)
    const links: string[] = []

    $(selector).each((_: number, el: any) => {
      const href = $(el).attr('href')
      if (!href) return

      // Resolve relative URLs
      if (baseUrl && !href.startsWith('http://') && !href.startsWith('https://')) {
        try {
          const resolved = new URL(href, baseUrl).toString()
          links.push(resolved)
        } catch {
          links.push(href) // can't resolve, keep as-is
        }
      } else {
        links.push(href)
      }
    })

    // Deduplicate
    //  const unique = [...new Set(links)]

    const unique = links.reduce((acc, link) => {
      if (!acc.includes(link)) acc.push(link)
      return acc
    }, [] as string[])

    enviroment.setOutput('Links', JSON.stringify(unique))
    enviroment.setOutput('Count', String(unique.length))
    enviroment.log.info(`ExtractLinks: found ${unique.length} unique links with selector "${selector}"`)
    return true
  } catch (error: any) {
    enviroment.log.error(`ExtractLinks error: ${error?.message ?? error}`)
    return false
  }
}
