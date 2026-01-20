import { ExecutionEnviroment } from '@/types/Enviroment'
import * as fs from 'fs'
import * as path from 'path'
import { SaveScreenshot } from '../task/SaveScreenshot'
import { ImageFile } from '@/types/TaskType'

export async function SaveScreenshotExecutor(
  enviroment: ExecutionEnviroment<typeof SaveScreenshot>
): Promise<boolean> {
  try {
    const screenshotJson = enviroment.getInput('Screenshot')
    if (!screenshotJson) {
      enviroment.log.error("Screenshot input is empty")
      return false
    }

    const filePath = enviroment.getInput('File path')
    if (!filePath) {
      enviroment.log.error("File path is required")
      return false
    }

    let screenshot: ImageFile
    try {
      screenshot = JSON.parse(screenshotJson)
    } catch (error) {
      enviroment.log.error("Failed to parse screenshot JSON")
      return false
    }

    if (!screenshot.data) {
      enviroment.log.error("Screenshot data is missing")
      return false
    }

    // Create directory if it doesn't exist
    const directory = path.dirname(filePath)
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true })
      enviroment.log.info(`Created directory: ${directory}`)
    }

    // Convert base64 to buffer and save
    const imageBuffer = Buffer.from(screenshot.data, 'base64')
    fs.writeFileSync(filePath, imageBuffer)
    
    enviroment.log.info(`Screenshot saved to: ${filePath}`)
    enviroment.setOutput('Saved path', filePath)
    return true
  } catch (error) {
    enviroment.log.error(`Error saving screenshot: ${error}`)
    return false
  }
}