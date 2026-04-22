import { ExecutionEnviroment } from '@/types/Enviroment'
import { ExtractTablesFromPdf } from '../task/ExtractTablesFromPdf'
import { pdfServiceClient } from '@/lib/PdfServiceClient'

export async function ExtractTablesFromPdfExecutor(
  enviroment: ExecutionEnviroment<typeof ExtractTablesFromPdf>
): Promise<boolean> {
  try {
    const pdfFile: unknown = enviroment.getInput('PDF file')
    if (!pdfFile) {
      enviroment.log.error('PDF file is not provided')
      return false
    }

    enviroment.log.info('Starting PDF table extraction via service')

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

    enviroment.log.info('Sending PDF to extraction service...')

    try {
      // Вызываем микросервис для извлечения таблиц
      const result = await pdfServiceClient.extractTablesFromBase64(base64Data)

      enviroment.log.info(`Service returned ${result.count} table(s)`)

      if (result.count === 0) {
        enviroment.log.info('No tables found in PDF')
        const emptyResult = JSON.stringify({ tables: [], count: 0 }, null, 2)
        enviroment.setOutput('Tables JSON', emptyResult)
        enviroment.setOutput('Table count', '0')
        return true
      }

      // Формируем результат
      const jsonOutput = JSON.stringify(result, null, 2)
      
      enviroment.log.info(
        `Successfully extracted ${result.count} table(s) with ${result.summary.totalRows} total rows`
      )

      // Логируем превью первой таблицы
      if (result.tables.length > 0 && result.tables[0].rows.length > 0) {
        enviroment.log.info(`First table preview (${Math.min(3, result.tables[0].rows.length)} rows):`)
        result.tables[0].rows.slice(0, 3).forEach((row, idx) => {
          enviroment.log.info(`Row ${idx + 1}: ${row.slice(0, 5).join(' | ')}${row.length > 5 ? '...' : ''}`)
        })
      }

      enviroment.setOutput('Tables JSON', jsonOutput)
      enviroment.setOutput('Table count', result.count.toString())
      
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
      enviroment.log.error(`Error extracting tables from PDF: ${error.message}`)
      enviroment.log.error(`Stack trace: ${error.stack}`)
    } else {
      enviroment.log.error(`Unknown error: ${String(error)}`)
    }
    return false
  }
}