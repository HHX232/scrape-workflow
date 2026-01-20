import { ExecutionEnviroment } from '@/types/Enviroment'
import { DownloadImages } from '../task/DownloadImages'

import * as fs from 'fs'
import * as path from 'path'
import { ImageMetadata } from '@/types/TaskType'
import axios from 'axios'
export async function DownloadImagesExecutor(
  enviroment: ExecutionEnviroment<typeof DownloadImages>
): Promise<boolean> {
  try {
    const imagesJson = enviroment.getInput('Images')
    if (!imagesJson) {
      enviroment.log.error("Images input is empty")
      return false
    }

    const downloadPath = enviroment.getInput('Download path')
    if (!downloadPath) {
      enviroment.log.error("Download path is required")
      return false
    }

    const baseUrl = enviroment.getInput('Base URL') || ''

    let images: ImageMetadata[]
    try {
      images = JSON.parse(imagesJson)
    } catch (error) {
      enviroment.log.error("Failed to parse images JSON")
      return false
    }

    // Create download directory if it doesn't exist
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true })
      enviroment.log.info(`Created directory: ${downloadPath}`)
    }

    const downloadedFiles: string[] = []
    let successCount = 0

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      try {
        // Resolve URL (handle relative paths)
        let imageUrl = image.src
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
          if (baseUrl) {
            imageUrl = new URL(imageUrl, baseUrl).href
          } else {
            enviroment.log.error(`Relative URL found but no Base URL provided: ${imageUrl}`)
            continue
          }
        }

        // Skip data URLs
        if (imageUrl.startsWith('data:')) {
          enviroment.log.info(`Skipping data URL at index ${i}`)
          continue
        }

        // Generate filename
        const urlPath = new URL(imageUrl).pathname
        const extension = path.extname(urlPath) || '.jpg'
        const filename = `image_${i + 1}_${Date.now()}${extension}`
        const filepath = path.join(downloadPath, filename)

        // Download image
        enviroment.log.info(`Downloading: ${imageUrl}`)
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 30000
        })

        // Save to disk
        fs.writeFileSync(filepath, response.data)
        downloadedFiles.push(filepath)
        successCount++
        enviroment.log.info(`Saved: ${filepath}`)

      } catch (error) {
        enviroment.log.error(`Failed to download image ${i + 1}: ${error}`)
      }
    }

    if (downloadedFiles.length === 0) {
      enviroment.log.error("No images were downloaded")
      return false
    }

    enviroment.log.info(`Successfully downloaded ${successCount}/${images.length} images`)
    enviroment.setOutput('Downloaded files', JSON.stringify(downloadedFiles, null, 2))
    return true
  } catch (error) {
    enviroment.log.error(`Error downloading images: ${error}`)
    return false
  }
}