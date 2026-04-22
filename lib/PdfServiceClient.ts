import axios, { AxiosInstance } from 'axios'

interface ExtractFromUrlResponse {
  success: boolean
  data: {
    text: string
    pageCount: number
    characterCount: number
    source: string
    url: string
  }
}
interface TablesToExcelResponse {
  success: boolean
  data: ArrayBuffer // или Uint8Array, но ArrayBuffer лучше для File
}
interface ExtractFromBase64Response {
  success: boolean
  data: {
    text: string
    pageCount: number
    characterCount: number
    source: string
  }
}

interface DownloadPdfResponse {
  success: boolean
  data: {
    base64: string
    size: number
    url: string
  }
}

interface TableData {
  page: number
  rowCount: number
  columnCount: number
  rows: string[][]
}

interface ExtractTablesResponse {
  success: boolean
  data: {
    tables: TableData[]
    count: number
    summary: {
      totalRows: number
      totalColumns: number
      averageColumns: number
      pagesWithTables: number
    }
  }
}

interface ImageData {
  page: number
  imageIndex: number
  width: number | null
  height: number | null
  format: string
  data: string // base64 encoded image
  size: number
}

interface ExtractImagesResponse {
  success: boolean
  data: {
    images: ImageData[]
    count: number
    summary: {
      totalSize: number
      pagesWithImages: number
    }
  }
}

class PdfServiceClient {
  private client: AxiosInstance

  constructor(baseURL: string = process.env.NEXT_PUBLIC_PDF_SERVICE_URL || 'http://localhost:3001') {
    this.client = axios.create({
      baseURL: `${baseURL}/api/pdf`,
      timeout: 120000, // 2 minutes for large files
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Extract text from PDF by URL
   */
  async extractFromUrl(url: string): Promise<string> {
    try {
      const response = await this.client.post<ExtractFromUrlResponse>('/extract-from-url', { url })
      return response.data.data.text
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to extract text from URL')
      }
      throw error
    }
  }

  /**
   * Extract text from base64 encoded PDF
   */
  async extractFromBase64(base64: string): Promise<string> {
    try {
      const response = await this.client.post<ExtractFromBase64Response>('/extract-from-base64', { base64 })
      return response.data.data.text
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to extract text from base64')
      }
      throw error
    }
  }

  /**
   * Extract text from uploaded file
   */
  async extractFromFile(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await this.client.post('/extract-from-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data.data.text
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to extract text from file')
      }
      throw error
    }
  }

  /**
   * Download PDF from URL and return as base64
   */
  async downloadPdf(url: string): Promise<string> {
    try {
      const response = await this.client.post<DownloadPdfResponse>('/download', { url })
      return response.data.data.base64
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to download PDF')
      }
      throw error
    }
  }

  /**
   * Extract tables from base64 encoded PDF
   */
  async extractTablesFromBase64(base64: string): Promise<ExtractTablesResponse['data']> {
    try {
      const response = await this.client.post<ExtractTablesResponse>('/extract-tables-from-base64', { base64 })
      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to extract tables from base64')
      }
      throw error
    }
  }

  /**
   * Extract tables from uploaded file
   */
  async extractTablesFromFile(file: File): Promise<ExtractTablesResponse['data']> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await this.client.post<ExtractTablesResponse>('/extract-tables-from-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to extract tables from file')
      }
      throw error
    }
  }

  /**
   * Extract images from base64 encoded PDF
   */
  async extractImagesFromBase64(base64: string): Promise<ExtractImagesResponse['data']> {
    try {
      const response = await this.client.post<ExtractImagesResponse>('/extract-images-from-base64', { base64 })
      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to extract images from base64')
      }
      throw error
    }
  }

  /**
   * Extract images from uploaded file
   */
  async extractImagesFromFile(file: File): Promise<ExtractImagesResponse['data']> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await this.client.post<ExtractImagesResponse>('/extract-images-from-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to extract images from file')
      }
      throw error
    }
  }

  /**
   * Extract images from PDF by URL
   */
  async extractImagesFromUrl(url: string): Promise<ExtractImagesResponse['data']> {
    try {
      const response = await this.client.post<ExtractImagesResponse>('/extract-images-from-url', { url })
      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to extract images from URL')
      }
      throw error
    }
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.client.defaults.baseURL?.replace('/api/pdf', '')}/health`)
      return response.data.status === 'ok'
    } catch {
      return false
    }
  }
  async tablesToExcel(tablesJson: string): Promise<ArrayBuffer> {
    try {
      const response = await this.client.post<TablesToExcelResponse>('/tables-to-excel', { tablesJson })
      
      // Возвращаем ArrayBuffer для создания File
      const arrayBuffer = response.data.data as unknown as ArrayBuffer
      return arrayBuffer
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Failed to generate Excel'
        throw new Error(message)
      }
      throw error
    }
  }
  
}

// Export singleton instance
export const pdfServiceClient = new PdfServiceClient()

// Export class for custom instances
export default PdfServiceClient