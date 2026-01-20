import { ExecutionEnviroment } from '@/types/Enviroment'
import * as cheerio from 'cheerio'
import { ExtractTextFromElements } from '../task/ExtractTextFromElements'

export async function ExtractTextFromElementsExecutor(
  enviroment: ExecutionEnviroment<typeof ExtractTextFromElements>
): Promise<boolean> {
  try {
    const selector = enviroment.getInput('Selector')
    if (!selector) {
      enviroment.log.error("Selector is not provided")
      return false
    }
    
    const html = enviroment.getInput('Html')
    if (!html) {
      enviroment.log.error("HTML input is empty")
      return false
    }
    
    const $ = cheerio.load(html)
    const elements = $(selector)
    
    if (!elements || elements.length === 0) {
      enviroment.log.error(`No elements found with selector: ${selector}`)
      return false
    }

    enviroment.log.info(`Found ${elements.length} element(s) with selector`)

    const extractedTexts: string[] = []
    elements.each((index, element) => {
      const text = $(element).text().trim()
      if (text) {
        extractedTexts.push(text)
      }
    })
    
    if (extractedTexts.length === 0) {
      enviroment.log.error("No text content found in any elements")
      return false
    }
    
    enviroment.log.info(`Successfully extracted ${extractedTexts.length} text entries`)
    enviroment.setOutput('Extracted texts', JSON.stringify(extractedTexts, null, 2))
    return true
  } catch (error) {
    enviroment.log.error(`Error extracting texts: ${error}`)
    return false
  }
}