import { ExecutionEnviroment } from '@/types/Enviroment'
import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import JSZip from 'jszip'
import { join } from 'path'
import { SaveImagesToZip } from '../task/SaveImagesToZip'

interface ImageData {
  page: number
  imageIndex: number
  width: number | null
  height: number | null
  format: string
  data: string // base64 encoded image OR comma-separated bytes
  size: number
}

interface ImagesJson {
  images: ImageData[]
  count: number
  summary: {
    totalSize: number
    pagesWithImages: number
  }
}

export async function SaveImagesToZipExecutor(
  enviroment: ExecutionEnviroment<typeof SaveImagesToZip>
): Promise<boolean> {
  try {
    const imagesJsonInput: unknown = enviroment.getInput('Images JSON')
    if (!imagesJsonInput) {
      enviroment.log.error('Images JSON is not provided')
      return false
    }

    enviroment.log.info('Starting ZIP creation from images JSON')

    // Парсим JSON
    let imagesData: ImagesJson
    try {
      if (typeof imagesJsonInput === 'string') {
        imagesData = JSON.parse(imagesJsonInput)
      } else {
        imagesData = imagesJsonInput as ImagesJson
      }
    } catch (error) {
      enviroment.log.error(`Failed to parse Images JSON: ${error}`)
      return false
    }

    // Валидация данных
    if (!imagesData.images || !Array.isArray(imagesData.images)) {
      enviroment.log.error('Invalid Images JSON structure: missing images array')
      return false
    }

    if (imagesData.images.length === 0) {
      enviroment.log.info('No images to save - JSON contains 0 images')
      return false
    }

    enviroment.log.info(`Found ${imagesData.count} image(s) to save`)

    // Создаем ZIP архив
    const zip = new JSZip()

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < imagesData.images.length; i++) {
      const image = imagesData.images[i]
      
      try {
        // Определяем расширение файла
        const extension = image.format || 'png'
        
        // Генерируем имя файла
        const fileName = `page_${String(image.page).padStart(3, '0')}_image_${String(image.imageIndex).padStart(2, '0')}.${extension}`

        let imageBuffer: Buffer

        // Определяем формат данных
        const dataStr = image.data
        
        // Проверяем: это массив байтов (есть запятые и начинается с цифр) или base64
        const looksLikeByteArray = /^[\d,\s]+$/.test(dataStr.substring(0, 100))
        
        if (looksLikeByteArray) {
          // Формат: "137,80,78,71,13,10,26,10,..."
          enviroment.log.info(`Processing byte array format for ${fileName}`)
          
          try {
            // Разбиваем по запятым и конвертируем в числа
            const bytes = dataStr.split(',').map(b => parseInt(b.trim(), 10))
            
            // Проверяем что все значения валидны (0-255)
            const invalidBytes = bytes.filter(b => isNaN(b) || b < 0 || b > 255)
            if (invalidBytes.length > 0) {
              enviroment.log.error(`Found ${invalidBytes.length} invalid byte values`)
              failCount++
              continue
            }
            
            // Создаём Buffer из массива байтов
            imageBuffer = Buffer.from(bytes)
            enviroment.log.info(`Created buffer from ${bytes.length} bytes`)
            
          } catch (error) {
            enviroment.log.error(`Failed to parse byte array: ${error}`)
            failCount++
            continue
          }
          
        } else {
          // Формат: base64 строка
          enviroment.log.info(`Processing base64 format for ${fileName}`)
          
          let base64Data = dataStr
          
          // Удаляем data URI префикс если есть
          if (base64Data.startsWith('data:')) {
            const match = base64Data.match(/^data:[^;]+;base64,(.+)$/)
            if (match) {
              base64Data = match[1]
              enviroment.log.info('Removed data URI prefix')
            }
          }
          
          // Очищаем пробелы
          base64Data = base64Data.replace(/\s/g, '')
          
          // Проверяем валидность base64
          if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
            enviroment.log.error(`Invalid base64 data for ${fileName}`)
            failCount++
            continue
          }
          
          // Конвертируем base64 в Buffer
          imageBuffer = Buffer.from(base64Data, 'base64')
          enviroment.log.info(`Created buffer from base64 (${base64Data.length} chars)`)
        }

        // Проверяем что получили валидные данные
        if (imageBuffer.length === 0) {
          enviroment.log.error(`Empty buffer for ${fileName}`)
          failCount++
          continue
        }

        // Проверяем размер
        const bufferSizeKB = (imageBuffer.length / 1024).toFixed(2)
        const expectedSizeKB = (image.size / 1024).toFixed(2)
        enviroment.log.info(`Buffer: ${bufferSizeKB} KB, Expected: ${expectedSizeKB} KB`)

        // Проверяем формат по сигнатуре
        const firstBytes = imageBuffer.slice(0, 4)
        const signature = firstBytes.toString('hex')
        enviroment.log.info(`File signature: ${signature}`)
        
        // PNG: 89504e47
        // JPEG: ffd8ff
        const isPNG = signature.startsWith('89504e47')
        const isJPEG = signature.startsWith('ffd8ff')
        
        if (!isPNG && !isJPEG) {
          enviroment.log.error(`⚠️  Unknown format signature: ${signature}`)
        } else {
          enviroment.log.info(`✓ Valid ${isPNG ? 'PNG' : 'JPEG'} signature detected`)
        }

        // Добавляем файл в ZIP без сжатия (изображения уже сжаты)
        zip.file(fileName, imageBuffer, {
          binary: true,
          compression: 'STORE'
        })

        const dimensions = image.width && image.height ? `${image.width}x${image.height}` : 'unknown'
        enviroment.log.info(`✓ Added: ${fileName} (${dimensions}, ${bufferSizeKB} KB)`)
        successCount++
        
      } catch (error) {
        enviroment.log.error(`✗ Failed processing image ${image.imageIndex} from page ${image.page}: ${error}`)
        failCount++
      }
    }

    if (successCount === 0) {
      enviroment.log.error('Failed to add any images to ZIP')
      return false
    }

    enviroment.log.info(`Successfully added ${successCount}/${imagesData.count} image(s) to ZIP`)
    if (failCount > 0) {
      enviroment.log.error(`⚠️  Failed to add ${failCount} image(s)`)
    }

    // Генерируем ZIP файл
    enviroment.log.info('Generating ZIP archive...')
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    })

    // Определяем путь для сохранения
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const zipFileName = `pdf_images_${timestamp}.zip`
    
    let zipFilePath: string
    let downloadUrl: string

    const publicDownloadsDir = join(process.cwd(), 'public', 'downloads')
    if (existsSync(join(process.cwd(), 'public'))) {
      if (!existsSync(publicDownloadsDir)) {
        await mkdir(publicDownloadsDir, { recursive: true })
      }
      zipFilePath = join(publicDownloadsDir, zipFileName)
      downloadUrl = `/downloads/${zipFileName}`
    } else {
      const tmpDir = '/tmp/pdf-images'
      if (!existsSync(tmpDir)) {
        await mkdir(tmpDir, { recursive: true })
      }
      zipFilePath = join(tmpDir, zipFileName)
      downloadUrl = zipFilePath
    }

    // Сохраняем ZIP файл
    await writeFile(zipFilePath, zipBuffer)

    const zipSizeKB = (zipBuffer.length / 1024).toFixed(2)
    const originalSizeKB = (imagesData.summary.totalSize / 1024).toFixed(2)
    const compressionRatio = ((1 - zipBuffer.length / imagesData.summary.totalSize) * 100).toFixed(1)

    enviroment.log.info('✓ ZIP archive created successfully!')
    enviroment.log.info(`📦 File: ${zipFileName}`)
    enviroment.log.info(`💾 Saved to: ${zipFilePath}`)
    enviroment.log.info(`🔗 Access: ${downloadUrl}`)
    enviroment.log.info('')
    enviroment.log.info('=== Summary ===')
    enviroment.log.info(`Images processed: ${imagesData.count}`)
    enviroment.log.info(`Successfully saved: ${successCount}`)
    if (failCount > 0) {
      enviroment.log.info(`Failed: ${failCount}`)
    }
    enviroment.log.info(`Pages with images: ${imagesData.summary.pagesWithImages}`)
    enviroment.log.info(`Original size: ${originalSizeKB} KB`)
    enviroment.log.info(`ZIP size: ${zipSizeKB} KB`)
    enviroment.log.info(`Compression: ${compressionRatio}% reduction`)

    return true

  } catch (error) {
    if (error instanceof Error) {
      enviroment.log.error(`Error creating ZIP archive: ${error.message}`)
      enviroment.log.error(`Stack trace: ${error.stack}`)
    } else {
      enviroment.log.error(`Unknown error: ${String(error)}`)
    }
    return false
  }
}