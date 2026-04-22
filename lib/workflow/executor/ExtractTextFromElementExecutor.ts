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
    
    const $ = cheerio.load(html)
    const element = $(selector)
    if (!element || element?.length === 0) {
      enviroment.log.error(`No elements found with selector: ${selector}`)
      return false
    }

    // enviroment.log.info(`Found ${element.length} element(s) with selector`)

    const extractedText = element.text()
    if(!extractedText){
      enviroment.log.error("Element has no text content")
      return false
    }
    
    // enviroment.log.info(`Successfully extracted text: ${extractedText.substring(0, 100)}...`)
    enviroment.setOutput('Extracted text', extractedText)
    return true
  } catch (error) {
    enviroment.log.error(`Error extracting text: ${error}`)
    return false
  }
}
