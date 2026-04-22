import { ExecutionEnviroment } from '@/types/Enviroment'
import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import * as XLSX from 'xlsx'
import { SaveTablesAsExcel } from '../task/SaveTablesAsExcel'

/* ===================== TYPES ===================== */

interface TableData {
  page: number
  tableIndex: number
  rowCount: number
  columnCount: number
  rows: string[][]
}

interface TablesSummary {
  totalRows: number
  totalColumns: number
  averageColumns: number
  pagesWithTables: number
}

interface TablesJson {
  tables: TableData[]
  count: number
  summary: TablesSummary
}

/* ===================== EXECUTOR ===================== */

export async function SaveTablesAsExcelExecutor(
  enviroment: ExecutionEnviroment<typeof SaveTablesAsExcel>
): Promise<boolean> {
  try {
    const tablesJsonInput: unknown = enviroment.getInput('Tables JSON')

    if (!tablesJsonInput) {
      enviroment.log.error('Tables JSON is not provided')
      return false
    }

    enviroment.log.info('Starting Excel generation from tables JSON')

    /* ---------- Parse input ---------- */

    let tablesData: TablesJson

    try {
      tablesData =
        typeof tablesJsonInput === 'string'
          ? JSON.parse(tablesJsonInput)
          : (tablesJsonInput as TablesJson)
    } catch (error) {
      enviroment.log.error(`Failed to parse Tables JSON: ${String(error)}`)
      return false
    }

    if (!tablesData.tables?.length) {
      enviroment.log.info('No tables to save')
      return false
    }

    enviroment.log.info(`Found ${tablesData.count} table(s) to save`)

    /* ---------- Create workbook ---------- */

    const workbook = XLSX.utils.book_new()
    let successCount = 0

    for (const table of tablesData.tables) {
      try {
        /* ----- Prepare worksheet data ----- */

        const wsData: XLSX.CellObject[][] | (string | number | boolean | Date)[][] =
          table.rows.map(row =>
            row.map(cell => cell ?? '')
          )

        const worksheet = XLSX.utils.aoa_to_sheet(wsData)

        /* ----- Auto column width ----- */

        const colWidths = table.rows[0]?.map((_, colIdx) =>
          Math.max(
            8,
            ...table.rows.map(row => String(row[colIdx] ?? '').length)
          )
        ) ?? []

        worksheet['!cols'] = colWidths.map(width => ({
          wch: Math.min(width + 2, 50)
        }))

        /* ----- Optional row height ----- */

        worksheet['!rows'] = table.rows.map(() => ({ hpx: 20 }))

        /* ----- Sheet name (Excel max 31 chars) ----- */

        const sheetName = `Table_P${table.page}_T${table.tableIndex}_${table.rowCount}x${table.columnCount}`.slice(
          0,
          31
        )

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

        enviroment.log.info(
          `✓ Added sheet: ${sheetName} (${table.rowCount} rows, ${table.columnCount} cols)`
        )

        successCount++
      } catch (error) {
        enviroment.log.error(
          `✗ Failed table ${table.tableIndex} on page ${table.page}: ${String(error)}`
        )
      }
    }

    if (successCount === 0) {
      enviroment.log.error('No valid tables to save')
      return false
    }

    /* ---------- Generate XLSX buffer ---------- */

    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      compression: true
    })

    /* ---------- Resolve save path ---------- */

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, -5)

    const excelFileName = `pdf_tables_${timestamp}.xlsx`

    let excelFilePath: string
    let downloadUrl: string

    const publicDir = join(process.cwd(), 'public')
    const downloadsDir = join(publicDir, 'downloads')

    if (existsSync(publicDir)) {
      if (!existsSync(downloadsDir)) {
        await mkdir(downloadsDir, { recursive: true })
      }

      excelFilePath = join(downloadsDir, excelFileName)
      downloadUrl = `/downloads/${excelFileName}`
    } else {
      const tmpDir = '/tmp/pdf-tables'

      if (!existsSync(tmpDir)) {
        await mkdir(tmpDir, { recursive: true })
      }

      excelFilePath = join(tmpDir, excelFileName)
      downloadUrl = excelFilePath
    }

    /* ---------- Save file ---------- */

    await writeFile(excelFilePath, excelBuffer)

    const fileSizeKB = (excelBuffer.length / 1024).toFixed(2)

    enviroment.log.info('✓ Excel file created successfully!')
    enviroment.log.info(`📊 File: ${excelFileName}`)
    enviroment.log.info(`💾 Path: ${excelFilePath}`)
    enviroment.log.info(`🔗 URL: ${downloadUrl}`)
    enviroment.log.info(
      `📈 Sheets: ${successCount}, Total rows: ${tablesData.summary.totalRows}`
    )
    enviroment.log.info(`💾 Size: ${fileSizeKB} KB`)

    /* ---------- Outputs ---------- */

    enviroment.setOutput('Excel file', excelFilePath)
    enviroment.setOutput('File name', excelFileName)

    return true
  } catch (error) {
    enviroment.log.error(
      `Error creating Excel: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
    return false
  }
}
