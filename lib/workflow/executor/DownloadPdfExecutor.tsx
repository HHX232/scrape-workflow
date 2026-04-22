import { ExecutionEnviroment } from '@/types/Enviroment'
import axios from 'axios'
import { DownloadPdf } from '../task/DownloadPdf'

export async function DownloadPdfExecutor(
  enviroment: ExecutionEnviroment<typeof DownloadPdf>
): Promise<boolean> {
  try {
    const pdfUrl = enviroment.getInput('URL')
    if (!pdfUrl) {
      enviroment.log.error("PDF URL is not provided")
      return false
    }

    // Валидация URL
    let url: URL
    try {
      url = new URL(pdfUrl)
      if (!['http:', 'https:'].includes(url.protocol)) {
        enviroment.log.error("Only HTTP and HTTPS protocols are supported")
        return false
      }
    } catch (error) {
      enviroment.log.error("Invalid URL format")
      return false
    }

    enviroment.log.info(`Downloading PDF from: ${pdfUrl}`)

    // Скачиваем PDF файл
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      timeout: 60000, 
      maxContentLength: 50 * 1024 * 1024, // 50MB максимум
      maxBodyLength: 50 * 1024 * 1024,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/pdf,*/*'
      },
      validateStatus: (status) => status >= 200 && status < 300
    })

    const contentType = response.headers['content-type']
    if (contentType && !contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      enviroment.log.error(`Invalid content type: ${contentType}. Expected PDF.`)
      return false
    }

    if (!response.data || response.data.byteLength === 0) {
      enviroment.log.error("Downloaded PDF file is empty")
      return false
    }


    enviroment.log.info(
      `PDF downloaded successfully, size: ${(response.data.byteLength / 1024).toFixed(2)} KB`
    )

    const pdfBuffer = Buffer.from(response.data)
    
    enviroment.setOutput('PDF file', pdfBuffer)
    return true
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        enviroment.log.error("PDF download timeout - file may be too large")
      } else if (error.response) {
        enviroment.log.error(
          `Failed to download PDF: HTTP ${error.response.status} ${error.response.statusText}`
        )
      } else if (error.request) {
        const pdfUrl = enviroment.getInput('URL')
        enviroment.log.error(`Network error: Could not reach ${pdfUrl}`)
      } else {
        enviroment.log.error(`Download error: ${error.message}`)
      }
    } else if (error instanceof Error) {
      enviroment.log.error(`Error downloading PDF: ${error.message}`)
    } else {
      enviroment.log.error(`Unknown error: ${error}`)
    }
    return false
  }
}