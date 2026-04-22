'use server'

/**
 * Server Action для извлечения таблиц из PDF
 * Файл: /app/actions/extractTablesFromPdfServer.ts
 * 
 * ВАЖНО: Этот файл ДОЛЖЕН быть .ts (не .tsx) и находиться в /app/actions/
 */

// Динамический импорт только на сервере
async function getExtractor() {
  // Импортируем только когда функция вызывается (на сервере)
  const { extractTablesFromPdfServer } = await import(
    './extractTablesFromPdfServer'
  )
  return extractTablesFromPdfServer
}

interface Table {
  tableIndex: number
  page: number
  rows: string[][]
  columnCount: number
  rowCount: number
}

interface ExtractResult {
  success: boolean
  tables: Table[]
  error?: string
}

/**
 * Server Action для извлечения таблиц из PDF
 * Эта функция выполняется ТОЛЬКО на сервере
 */
export async function extractTablesAction(pdfBuffer: Buffer): Promise<ExtractResult> {
  try {
    console.log('[Server Action] Calling extractor...')
    const extractor = await getExtractor()
    const result = await extractor(pdfBuffer)
    console.log('[Server Action] Extraction complete:', result.success, 'tables:', result.tables.length)
    return result
  } catch (error) {
    console.error('[Server Action] Error:', error)
    return {
      success: false,
      tables: [],
      error: error instanceof Error ? error.message : String(error)
    }
  }
}