import { ExecutionEnviroment } from '@/types/Enviroment'
import { TakeScreenshot } from '../task/TakeScreenshot'
import { ImageFile } from '@/types/TaskType'

export async function TakeScreenshotExecutor(
  enviroment: ExecutionEnviroment<typeof TakeScreenshot>
): Promise<boolean> {
  try {
    const page = enviroment.getPage()
    if (!page) {
      enviroment.log.error("Web page is not available")
      return false
    }

    const selector = enviroment.getInput('Selector')
    const fullPage = enviroment.getInput('Full page') === 'true' 
    
    let screenshotBase64: string

    if (selector) {
      // Screenshot of specific element
      enviroment.log.info(`Taking screenshot of element: ${selector}`)
      
      const element = await page.$(selector)
      if (!element) {
        enviroment.log.error(`Element not found with selector: ${selector}`)
        return false
      }
      
      screenshotBase64 = await element.screenshot({ 
        encoding: 'base64',
        type: 'png'
      }) as string
    } else {
      // Screenshot of full page or viewport
      enviroment.log.info(`Taking ${fullPage ? 'full page' : 'viewport'} screenshot`)
      
      screenshotBase64 = await page.screenshot({ 
        encoding: 'base64',
        type: 'png',
        fullPage: fullPage
      }) as string
    }
    
    if (!screenshotBase64) {
      enviroment.log.error("Failed to capture screenshot")
      return false
    }
    
    const imageFile: ImageFile = {
      data: screenshotBase64,
      format: 'png',
      filename: `screenshot-${Date.now()}.png`
    }
    
    enviroment.log.info("Screenshot captured successfully")
    enviroment.setOutput('Screenshot', JSON.stringify(imageFile))
    return true
  } catch (error) {
    enviroment.log.error(`Error taking screenshot: ${error}`)
    return false
  }
}