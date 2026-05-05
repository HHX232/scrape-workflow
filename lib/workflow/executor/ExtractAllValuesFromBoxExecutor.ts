import { ExecutionEnviroment } from '@/types/Enviroment'
import * as cheerio from 'cheerio'
import { ExtractAllValuesFromBoxTask } from '../task/ExtractAllValuesFromBoxTask'

export async function ExtractAllValuesFromBoxExecutor(
  enviroment: ExecutionEnviroment<typeof ExtractAllValuesFromBoxTask>
): Promise<boolean> {
  try {
    const html = enviroment.getInput('Html')
    if (!html) {
      enviroment.log.error('input -> Html is not defined')
      return false
    }

    const containerSelector = enviroment.getInput('Container Selector')
    if (!containerSelector) {
      enviroment.log.error('input -> Container Selector is not defined')
      return false
    }

    const attribute = enviroment.getInput('Attribute')
    if (!attribute) {
      enviroment.log.error('input -> Attribute is not defined')
      return false
    }

    const elementSelector = enviroment.getInput('Element Selector') || '*'
    const baseUrl = enviroment.getInput('Base URL') || ''

    const looksLikeUrlPath = (val: string) =>
      val.startsWith('/') || val.startsWith('./') || val.startsWith('../')

    const resolveValue = (val: string): string => {
      if (!baseUrl || val.startsWith('http://') || val.startsWith('https://') || !looksLikeUrlPath(val)) {
        return val
      }
      try { return new URL(val, baseUrl).toString() } catch { return val }
    }

    const $ = cheerio.load(html)
    const container = $(containerSelector)

    if (container.length === 0) {
      enviroment.log.info(`ExtractAllValuesFromBox: no elements found for selector "${containerSelector}"`)
      enviroment.setOutput('Values', '[]')
      enviroment.setOutput('Count', '0')
      return true
    }

    const values: string[] = []

    container.find(elementSelector).each((_: number, el: any) => {
      const val = $(el).attr(attribute)
      if (val !== undefined && val !== null && val !== '') {
        values.push(resolveValue(val))
      }
    })

    // Also check the container elements themselves
    container.each((_: number, el: any) => {
      const val = $(el).attr(attribute)
      if (val !== undefined && val !== null && val !== '') {
        values.push(resolveValue(val))
      }
    })

    // Deduplicate
    const unique = [...new Set(values)]

    enviroment.setOutput('Values', JSON.stringify(unique))
    enviroment.setOutput('Count', String(unique.length))
    enviroment.log.info(
      `ExtractAllValuesFromBox: found ${unique.length} unique "${attribute}" values in "${containerSelector}"`
    )
    return true
  } catch (error: any) {
    enviroment.log.error(`ExtractAllValuesFromBox error: ${error?.message ?? error}`)
    return false
  }
}
