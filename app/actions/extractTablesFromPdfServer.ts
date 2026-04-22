// lib/workflow/executor/server/extractTablesFromPdfServer.ts
// Правильный импорт для pdf-parse v2
import { PDFParse } from 'pdf-parse'

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
 * Извлекает таблицы из PDF используя библиотеку pdf-parse
 */
export async function extractTablesFromPdfServer(pdfBuffer: Buffer): Promise<ExtractResult> {
  try {
    console.log('========================================')
    console.log('🚀 Starting PDF table extraction')
    console.log('========================================')
    console.log(`📄 PDF Buffer size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`)
    console.log(`📄 Buffer type: ${Buffer.isBuffer(pdfBuffer) ? 'Buffer' : 'Not a Buffer'}`)
    
    // Создаем парсер с буфером
    console.log('🔧 Creating PDFParse instance...')
    const parser = new PDFParse({ data: pdfBuffer })
    console.log('✅ Parser created successfully')
    
    console.log('📊 Calling getTable()...')
    
    // Извлекаем таблицы
    const result = await parser.getTable()
    
    console.log('✅ getTable() completed')
    console.log('📦 Result structure:', {
      hasResult: !!result,
      resultType: typeof result,
      hasPages: !!result?.pages,
      pagesType: result?.pages ? (Array.isArray(result.pages) ? 'array' : typeof result.pages) : 'undefined',
      pagesCount: result?.pages?.length || 0
    })
    
    // Уничтожаем парсер
    await parser.destroy()
    console.log('🗑️  Parser destroyed')

    // Проверяем структуру результата
    if (!result) {
      console.log('❌ Result is null/undefined')
      return { success: true, tables: [] }
    }

    if (!result.pages) {
      console.log('❌ result.pages is null/undefined')
      console.log('📦 Available keys in result:', Object.keys(result))
      return { success: true, tables: [] }
    }

    if (!Array.isArray(result.pages)) {
      console.log('❌ result.pages is not an array')
      console.log('📦 result.pages type:', typeof result.pages)
      console.log('📦 result.pages value:', result.pages)
      return { success: true, tables: [] }
    }

    if (result.pages.length === 0) {
      console.log('⚠️  result.pages is empty array')
      return { success: true, tables: [] }
    }

    console.log(`✅ Found ${result.pages.length} page(s)`)
    console.log('')

    // Собираем все таблицы
    const tables: Table[] = []
    let globalTableIndex = 0

    // Проходим по каждой странице
    for (let pageIndex = 0; pageIndex < result.pages.length; pageIndex++) {
      const page = result.pages[pageIndex]
      const pageNumber = pageIndex + 1

      console.log(`📄 Page ${pageNumber}:`)
      console.log(`   - page exists: ${!!page}`)
      console.log(`   - page type: ${typeof page}`)
      
      if (page) {
        console.log(`   - has tables property: ${!!page.tables}`)
        console.log(`   - tables type: ${page.tables ? (Array.isArray(page.tables) ? 'array' : typeof page.tables) : 'undefined'}`)
        console.log(`   - tables count: ${page.tables?.length || 0}`)
        console.log(`   - page keys: [${Object.keys(page).join(', ')}]`)
      }

      // Проверяем наличие таблиц на странице
      if (!page || !page.tables || !Array.isArray(page.tables) || page.tables.length === 0) {
        console.log(`   ❌ No valid tables on page ${pageNumber}`)
        console.log('')
        continue
      }

      console.log(`   ✅ Found ${page.tables.length} table(s)`)

      // Обрабатываем каждую таблицу
      for (let tableIdx = 0; tableIdx < page.tables.length; tableIdx++) {
        const tableData = page.tables[tableIdx]
        globalTableIndex++

        console.log(`   📊 Table ${tableIdx + 1}:`)
        console.log(`      - isArray: ${Array.isArray(tableData)}`)
        console.log(`      - length: ${Array.isArray(tableData) ? tableData.length : 'N/A'}`)
        console.log(`      - type: ${typeof tableData}`)

        // Проверяем что таблица это массив строк
        if (!Array.isArray(tableData) || tableData.length === 0) {
          console.log(`      ❌ Invalid format or empty`)
          continue
        }

        // Проверяем первую строку для отладки
        if (tableData.length > 0) {
          console.log(`      - first row type: ${typeof tableData[0]}`)
          console.log(`      - first row isArray: ${Array.isArray(tableData[0])}`)
          if (Array.isArray(tableData[0])) {
            console.log(`      - first row length: ${tableData[0].length}`)
            console.log(`      - first row preview: [${tableData[0].slice(0, 3).map(c => `"${c}"`).join(', ')}...]`)
          } else {
            console.log(`      - first row value: ${tableData[0]}`)
          }
        }

        // Преобразуем строки таблицы
        const rows: string[][] = []
        
        for (let rowIdx = 0; rowIdx < tableData.length; rowIdx++) {
          const rowData = tableData[rowIdx]
          
          // Каждая строка должна быть массивом
          if (!Array.isArray(rowData)) {
            console.log(`      ⚠️  Row ${rowIdx + 1} is not an array (type: ${typeof rowData})`)
            continue
          }

          // Преобразуем ячейки в строки
          const cleanRow: string[] = rowData.map((cell: any) => {
            if (cell === null || cell === undefined) {
              return ''
            }
            return String(cell).trim()
          })
          
          rows.push(cleanRow)
        }

        // Пропускаем пустые таблицы
        if (rows.length === 0) {
          console.log(`      ❌ No valid rows after processing`)
          continue
        }

        // Находим максимальную ширину таблицы
        const columnCount = Math.max(...rows.map(r => r.length), 0)
        
        if (columnCount < 1) {
          console.log(`      ❌ No columns found`)
          continue
        }

        // Нормализуем все строки до одинаковой ширины
        const normalizedRows = rows.map(row => {
          const newRow = [...row]
          while (newRow.length < columnCount) {
            newRow.push('')
          }
          return newRow.slice(0, columnCount)
        })

        // Создаем объект таблицы
        const table: Table = {
          tableIndex: globalTableIndex,
          page: pageNumber,
          rows: normalizedRows,
          columnCount: columnCount,
          rowCount: normalizedRows.length
        }

        console.log(`      ✅ Table ${globalTableIndex}: ${table.rowCount} rows × ${table.columnCount} cols`)
        
        // Показываем превью первой строки
        if (normalizedRows.length > 0) {
          const preview = normalizedRows[0].slice(0, 3).map(c => `"${c}"`).join(' | ')
          console.log(`      📋 Preview: ${preview}${normalizedRows[0].length > 3 ? '...' : ''}`)
        }

        tables.push(table)
      }
      
      console.log('')
    }

    console.log('========================================')
    console.log(`✅ Extraction complete: ${tables.length} table(s) found`)
    console.log('========================================')

    return {
      success: true,
      tables: tables
    }

  } catch (error) {
    console.log('========================================')
    console.log('❌ PDF extraction failed!')
    console.log('========================================')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack)
    }
    
    return {
      success: false,
      tables: [],
      error: error instanceof Error ? error.message : String(error)
    }
  }
}