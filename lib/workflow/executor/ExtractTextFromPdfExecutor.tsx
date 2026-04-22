import { ExecutionEnviroment } from '@/types/Enviroment'
import PDFParser from 'pdf2json'
import { ExtractTextFromPdf } from '../task/ExtractTextFromPdf'

export async function ExtractTextFromPdfExecutor(
  enviroment: ExecutionEnviroment<typeof ExtractTextFromPdf>
): Promise<boolean> {
  console.log('[ExtractTextFromPdf] Executor started')

  try {
    console.log('[ExtractTextFromPdf] Full environment:', enviroment)

    const pdfFile: unknown = enviroment.getInput('PDF file')
    console.log('[ExtractTextFromPdf] Input PDF file type:', typeof pdfFile)

    if (!pdfFile) {
      console.error('[ExtractTextFromPdf] ERROR: PDF file is not provided')
      enviroment.log.error('PDF file is not provided')
      return false
    }

    enviroment.log.info('Starting PDF text extraction')
    console.log('[ExtractTextFromPdf] Starting PDF text extraction')

    let pdfBuffer: Buffer

    if (Buffer.isBuffer(pdfFile)) {
      console.log('[ExtractTextFromPdf] PDF input is Buffer')
      pdfBuffer = pdfFile
    } else if (typeof pdfFile === 'string') {
      console.log('[ExtractTextFromPdf] PDF input is base64 string')
      pdfBuffer = Buffer.from(pdfFile, 'base64')
    } else if (pdfFile instanceof ArrayBuffer) {
      console.log('[ExtractTextFromPdf] PDF input is ArrayBuffer')
      pdfBuffer = Buffer.from(pdfFile)
    } else {
      console.error('[ExtractTextFromPdf] ERROR: Invalid PDF file format')
      enviroment.log.error('Invalid PDF file format')
      return false
    }

    console.log(
      `[ExtractTextFromPdf] PDF buffer size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`
    )

    enviroment.log.info(
      `Processing PDF file, size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`
    )

    console.log('[ExtractTextFromPdf] Creating PDFParser instance')
    const pdfParser = new PDFParser(null, true)

    console.log('[ExtractTextFromPdf] Starting PDF parsing')

    const extractedText = await new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('[ExtractTextFromPdf] ERROR: PDF parsing timeout (30s)')
        reject(new Error('PDF parsing timeout (30 seconds)'))
      }, 30000)

      pdfParser.on(
        'pdfParser_dataError',
        (errMsg: Error | { parserError: Error }) => {
          clearTimeout(timeout)
          console.error('[ExtractTextFromPdf] pdfParser_dataError event:', errMsg)

          if (errMsg instanceof Error) {
            reject(errMsg)
          } else {
            reject(errMsg.parserError)
          }
        }
      )

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        clearTimeout(timeout)
        console.log('[ExtractTextFromPdf] pdfParser_dataReady event received')

        try {
          let text = ''
          let pageCount = 0

          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
            pageCount = pdfData.Pages.length
            console.log(`[ExtractTextFromPdf] Pages count: ${pageCount}`)

            pdfData.Pages.forEach((page: any, pageIndex: number) => {
              console.log(
                `[ExtractTextFromPdf] Processing page ${pageIndex + 1}`
              )

              if (page.Texts && Array.isArray(page.Texts)) {
                let pageText = ''

                page.Texts.forEach((textItem: any) => {
                  if (textItem.R && Array.isArray(textItem.R)) {
                    textItem.R.forEach((textRun: any) => {
                      if (textRun.T) {
                        try {
                          const decoded = decodeURIComponent(textRun.T)
                          pageText += decoded + ' '
                        } catch {
                          pageText += textRun.T + ' '
                        }
                      }
                    })
                  }
                })

                if (pageText.trim()) {
                  text += `${pageText.trim()}\n\n`
                }
              }
            })

            enviroment.log.info(`Processed ${pageCount} page(s)`)
            console.log(
              `[ExtractTextFromPdf] Finished processing ${pageCount} page(s)`
            )
          }

          text = text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim()

          console.log(
            `[ExtractTextFromPdf] Extracted text length: ${text.length}`
          )

          resolve(text)
        } catch (error) {
          console.error('[ExtractTextFromPdf] ERROR during text extraction:', error)
          reject(error)
        }
      })

      try {
        console.log('[ExtractTextFromPdf] Calling pdfParser.parseBuffer')
        pdfParser.parseBuffer(pdfBuffer)
      } catch (parseError) {
        clearTimeout(timeout)
        console.error(
          '[ExtractTextFromPdf] ERROR while calling parseBuffer:',
          parseError
        )
        reject(parseError)
      }
    })

    if (!extractedText || extractedText.length === 0) {
      console.error('[ExtractTextFromPdf] ERROR: No text extracted')
      enviroment.log.error('No text content extracted from PDF')
      return false
    }

    console.log(
      `[ExtractTextFromPdf] Successfully extracted ${extractedText.length} characters`
    )

    enviroment.log.info(
      `Successfully extracted ${extractedText.length} characters from PDF`
    )

    enviroment.setOutput('Extracted text', extractedText)
    console.log('[ExtractTextFromPdf] Output set successfully')

    console.log('[ExtractTextFromPdf] Executor finished successfully')
    return true
  } catch (error) {
    console.error('[ExtractTextFromPdf] ERROR: Executor crashed', error)

    if (error instanceof Error) {
      enviroment.log.error(`Error extracting text from PDF: ${error.message}`)
    } else {
      enviroment.log.error(`Unknown error: ${error}`)
    }

    return false
  }
}
