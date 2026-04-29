import {ExecutionEnviroment} from '@/types/Enviroment'
import {Worker} from 'worker_threads'
import {ExtractTextFromElement} from '../task/ExtractTextFromElement'

const PLACEHOLDER = 'ТЕКСТ НЕ НАЙДЕН'
const TIMEOUT_MS = 30_000
const CHUNK_SIZE = 5 * 1024 * 1024 // 5 MB per chunk
const MAX_CHUNKS = 3

const WORKER_CODE = `
const { parentPort, workerData } = require('worker_threads')
const cheerio = require('cheerio')

const { html, selector, joinMultiple } = workerData
try {
  const $ = cheerio.load(html)
  const elements = $(selector)
  if (!elements || elements.length === 0) {
    parentPort.postMessage({ text: null })
  } else {
    let text
    if (joinMultiple && elements.length > 1) {
      const parts = []
      elements.each((_, el) => {
        const t = $(el).text().trim()
        if (t) parts.push(t)
      })
      text = parts.join('\\n\\n')
    } else {
      text = elements.text().trim()
    }
    parentPort.postMessage({ text: text || null })
  }
} catch (e) {
  parentPort.postMessage({ error: e.message })
}
`

function splitHtml(html: string): string[] {
  const totalBytes = Buffer.byteLength(html, 'utf8')
  if (totalBytes <= CHUNK_SIZE) return [html]

  const chunks: string[] = []
  let offset = 0

  while (offset < html.length && chunks.length < MAX_CHUNKS) {
    // Берём примерно CHUNK_SIZE байт
    const end = Math.min(offset + CHUNK_SIZE, html.length)

    // Если не последний чанк — ищем ближайший конец тега чтобы не резать посередине
    let splitAt = end
    if (end < html.length) {
      const closeTag = html.lastIndexOf('>', end)
      if (closeTag > offset) splitAt = closeTag + 1
    }

    // Оборачиваем в валидный HTML чтобы cheerio корректно парсил фрагмент
    chunks.push(`<html><body>${html.slice(offset, splitAt)}</body></html>`)
    offset = splitAt
  }

  return chunks
}

function runWorker(html: string, selector: string, joinMultiple: boolean): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(WORKER_CODE, {
      eval: true,
      workerData: {html, selector, joinMultiple}
    })

    const timer = setTimeout(() => {
      worker.terminate()
      reject(new Error(`Worker timeout after ${TIMEOUT_MS}ms`))
    }, TIMEOUT_MS)

    worker.once('message', (msg: {text?: string | null; error?: string}) => {
      clearTimeout(timer)
      if (msg.error) reject(new Error(msg.error))
      else resolve(msg.text ?? null)
    })

    worker.once('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

export async function ExtractTextFromElementExecutor(
  enviroment: ExecutionEnviroment<typeof ExtractTextFromElement>
): Promise<boolean> {
  const selector = enviroment.getInput('Selector')
  if (!selector) {
    enviroment.log.error('Selector is not provided')
    return false
  }

  const html = enviroment.getInput('Html')
  if (!html) {
    enviroment.log.error('HTML input is empty')
    return false
  }

  const joinMultiple = enviroment.getInput('Join Multiple') === 'true'
  const chunks = splitHtml(html)

  if (chunks.length > 1) {
    enviroment.log.info(`HTML разбит на ${chunks.length} части для параллельного поиска`)
  }

  try {
    // Запускаем все чанки параллельно, берём первый непустой результат
    const text = await Promise.any(
      chunks.map(chunk =>
        runWorker(chunk, selector, joinMultiple).then(result => {
          if (!result) throw new Error('not found in chunk')
          return result
        })
      )
    )

    enviroment.setOutput('Extracted text', text)
    return true
  } catch {
    // Promise.any выбрасывает AggregateError если все чанки вернули null/ошибку
    enviroment.log.info(`Элемент не найден по селектору: ${selector}`)
    enviroment.setOutput('Extracted text', PLACEHOLDER)
    return true
  }
}
