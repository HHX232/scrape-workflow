import { pdfServiceClient } from '@/lib/PdfServiceClient'
import { ExecutionEnviroment } from '@/types/Enviroment'
import { ExtractImagesFromPdf } from '../task/ExtractImagesFromPdf'

export async function ExtractImagesFromPdfExecutor(
  enviroment: ExecutionEnviroment<typeof ExtractImagesFromPdf>
): Promise<boolean> {
  try {
    const pdfFile: unknown = enviroment.getInput('PDF file')
    if (!pdfFile) {
      enviroment.log.error('PDF file is not provided')
      return false
    }

    enviroment.log.info('Starting PDF image extraction via service')

    // Преобразуем файл в base64 строку для отправки на сервис
    let base64Data: string

    if (typeof pdfFile === 'string') {
      if (pdfFile.startsWith('data:')) {
        // Уже в формате data URL
        base64Data = pdfFile
        enviroment.log.info('Using data URL format')
      } else if (pdfFile.startsWith('http://') || pdfFile.startsWith('https://')) {
        // URL - сначала скачиваем
        enviroment.log.info('Downloading PDF from URL first')
        try {
          const downloaded = await pdfServiceClient.downloadPdf(pdfFile)
          base64Data = `data:application/pdf;base64,${downloaded}`
        } catch (error: any) {
          enviroment.log.error(`Failed to download PDF: ${error.message}`)
          return false
        }
      } else {
        // Чистый base64
        base64Data = `data:application/pdf;base64,${pdfFile}`
        enviroment.log.info('Using raw base64 format')
      }
    } else if (Buffer.isBuffer(pdfFile)) {
      // Buffer - конвертируем в base64
      enviroment.log.info('Converting Buffer to base64')
      base64Data = `data:application/pdf;base64,${pdfFile.toString('base64')}`
    } else if (pdfFile instanceof ArrayBuffer) {
      // ArrayBuffer - конвертируем в base64
      enviroment.log.info('Converting ArrayBuffer to base64')
      const buffer = Buffer.from(pdfFile)
      base64Data = `data:application/pdf;base64,${buffer.toString('base64')}`
    } else if (pdfFile && typeof pdfFile === 'object' && 'buffer' in pdfFile) {
      // Объект с buffer полем
      enviroment.log.info('Converting object.buffer to base64')
      const buffer = Buffer.from(pdfFile.buffer as ArrayBuffer)
      base64Data = `data:application/pdf;base64,${buffer.toString('base64')}`
    } else if (pdfFile && typeof pdfFile === 'object' && 'data' in pdfFile) {
      // Объект с data полем
      enviroment.log.info('Converting object.data to base64')
      const data = pdfFile.data as any
      let buffer: Buffer
      if (data instanceof Uint8Array) {
        buffer = Buffer.from(data)
      } else if (Array.isArray(data)) {
        buffer = Buffer.from(data)
      } else {
        enviroment.log.error('Invalid PDF file data format')
        return false
      }
      base64Data = `data:application/pdf;base64,${buffer.toString('base64')}`
    } else {
      enviroment.log.error(`Invalid PDF file format. Type: ${typeof pdfFile}`)
      if (pdfFile && typeof pdfFile === 'object') {
        enviroment.log.error(`Object keys: ${Object.keys(pdfFile).join(', ')}`)
      }
      return false
    }

    enviroment.log.info('Sending PDF to image extraction service...')

    try {
      // Вызываем микросервис для извлечения изображений
      const result = await pdfServiceClient.extractImagesFromBase64(base64Data)

      enviroment.log.info(`Service returned ${result.count} image(s)`)

      if (result.count === 0) {
        enviroment.log.info('No images found in PDF')
        const emptyResult = JSON.stringify({ images: [], count: 0, summary: { totalSize: 0, pagesWithImages: 0 } }, null, 2)
        enviroment.setOutput('Images JSON', emptyResult)
        enviroment.setOutput('Image count', '0')
        enviroment.setOutput('Total size', '0')
        return true
      }

      // Формируем результат
      const jsonOutput = JSON.stringify(result, null, 2)
      
      enviroment.log.info(
        `Successfully extracted ${result.count} image(s) with total size ${result.summary.totalSize} bytes`
      )

      // Логируем информацию о первом изображении
      if (result.images.length > 0) {
        const firstImage = result.images[0]
        enviroment.log.info(
          `First image: page ${firstImage.page}, size ${firstImage.width}x${firstImage.height}, ` +
          `format ${firstImage.format}, ${firstImage.size} bytes`
        )
      }

      // Логируем статистику по страницам
      enviroment.log.info(`Images found on ${result.summary.pagesWithImages} page(s)`)

      enviroment.setOutput('Images JSON', jsonOutput)
      enviroment.setOutput('Image count', result.count.toString())
      enviroment.setOutput('Total size', result.summary.totalSize.toString())
      
      return true

    } catch (serviceError: any) {
      enviroment.log.error(`PDF service error: ${serviceError.message}`)
      
      // Проверяем доступность сервиса
      const isHealthy = await pdfServiceClient.healthCheck()
      if (!isHealthy) {
        enviroment.log.error('⚠️  PDF service is not responding!')
        enviroment.log.error('Please ensure the PDF service is running on http://localhost:3001')
        enviroment.log.error('Run: cd pdf-service && npm run dev')
      }
      
      return false
    }

  } catch (error) {
    if (error instanceof Error) {
      enviroment.log.error(`Error extracting images from PDF: ${error.message}`)
      enviroment.log.error(`Stack trace: ${error.stack}`)
    } else {
      enviroment.log.error(`Unknown error: ${String(error)}`)
    }
    return false
  }
}