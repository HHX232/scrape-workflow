import { ExecutionEnviroment } from '@/types/Enviroment'
import * as cheerio from 'cheerio'
import { ExtractTextFromElement } from '../task/ExtractTextFromElement'

export async function ExtractTextFromElementExecutor(
  enviroment: ExecutionEnviroment<typeof ExtractTextFromElement>
): Promise<boolean> {
  try {
    // enviroment.log.info("Starting text extraction")
    
    const selector = enviroment.getInput('Selector')
    if (!selector) {
      enviroment.log.error("Selector is not provided")
      return false
    }
    
    // enviroment.log.info(`Using selector: ${selector}`)
    
    const html = enviroment.getInput('Html')
    if (!html) {
      enviroment.log.error("HTML input is empty")
      return false
    }
    
    // enviroment.log.info(`HTML length: ${html.length} characters`)
    
    const joinMultiple = enviroment.getInput('Join Multiple') === 'true'

    const $ = cheerio.load(html)
    const elements = $(selector)
    if (!elements || elements.length === 0) {
      enviroment.log.error(`No elements found with selector: ${selector}`)
      return false
    }

    let extractedText: string
    if (joinMultiple && elements.length > 1) {
      const parts: string[] = []
      elements.each((_: number, el: any) => {
        const t = $(el).text().trim()
        if (t) parts.push(t)
      })
      extractedText = parts.join('\n\n')
    } else {
      extractedText = elements.text().trim()
    }

    if (!extractedText) {
      enviroment.log.error('Element has no text content')
      return false
    }

    enviroment.setOutput('Extracted text', extractedText)
    return true
  } catch (error) {
    enviroment.log.error(`Error extracting text: ${error}`)
    return false
  }
}
