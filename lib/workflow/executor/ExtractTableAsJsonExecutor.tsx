import { ExecutionEnviroment } from '@/types/Enviroment'
import * as cheerio from 'cheerio'
import { ExtractTableAsJsonTask } from '../task/ExtractTableAsJsonTask'

export async function ExtractTableAsJsonExecutor(
  enviroment: ExecutionEnviroment<typeof ExtractTableAsJsonTask>
): Promise<boolean> {
  try {
    const html = enviroment.getInput('Html')
    if (!html) {
      enviroment.log.error('input -> Html is not defined')
      return false
    }

    const rawRowSelector = enviroment.getInput('Row Selector')
    if (!rawRowSelector) {
      enviroment.log.error('input -> Row Selector is not defined')
      return false
    }

    // Auto-strip positional pseudo-classes so raw DevTools selectors work:
    // "... > p:nth-child(1)" → "... > p"  (finds all sibling rows, not just one)
    const rowSelector = makeSiblingSelector(rawRowSelector)
    if (rowSelector !== rawRowSelector) {
      enviroment.log.info(`Row Selector normalised: "${rawRowSelector}" → "${rowSelector}"`)
    }

    const nameSelector = enviroment.getInput('Name Selector') || 'th, td:first-child, dt'
    const valueSelector = enviroment.getInput('Value Selector') || 'td:last-child, dd'
    const skipEmpty = enviroment.getInput('Skip Empty Rows') === 'true'

    const $ = cheerio.load(html)
    const rows = $(rowSelector)

    if (rows.length === 0) {
      enviroment.log.info(`ExtractTableAsJSON: no rows found with selector "${rowSelector}"`)
      enviroment.setOutput('JSON Array', '[]')
      enviroment.setOutput('Count', '0')
      return true
    }

    const result: Array<{ name: string; value: string }> = []

    rows.each((_: number, row: any) => {
      const rowEl = $(row)
      const nameEl = rowEl.find(nameSelector).first()

      // Name: strip trailing colon/whitespace
      const nameText = nameEl.text().trim().replace(/:\s*$/, '').trim()

      // Value: try explicit value selector first
      let valueText = ''
      const valueEl = rowEl.find(valueSelector).first()
      if (valueEl.length > 0) {
        valueText = valueEl.text().trim()
      }

      // Fallback: clone row, remove name element, take remaining text.
      // Handles <p><b>Key:</b> value_as_text_node</p> pattern.
      if (!valueText) {
        const clone = rowEl.clone()
        clone.find(nameSelector).first().remove()
        valueText = clone.text().trim().replace(/^:\s*/, '')
      }

      if (skipEmpty && (!nameText || !valueText)) return

      result.push({ name: nameText, value: valueText })
    })

    enviroment.setOutput('JSON Array', JSON.stringify(result))
    enviroment.setOutput('Count', String(result.length))
    enviroment.log.info(`ExtractTableAsJSON: extracted ${result.length} rows from "${rowSelector}"`)
    return true
  } catch (error: any) {
    enviroment.log.error(`ExtractTableAsJSON error: ${error?.message ?? error}`)
    return false
  }
}

// ── Selector utils ────────────────────────────────────────────────────────────

const POSITIONAL_RE = [
  /:nth-child\([^)]+\)/gi,
  /:nth-of-type\([^)]+\)/gi,
  /:nth-last-child\([^)]+\)/gi,
  /:nth-last-of-type\([^)]+\)/gi,
  /:first-child/gi,
  /:last-child/gi,
  /:first-of-type/gi,
  /:last-of-type/gi,
]

function hasPositional(part: string) {
  return POSITIONAL_RE.some(re => { re.lastIndex = 0; return re.test(part) })
}

function stripAllPositional(part: string) {
  let s = part
  for (const re of POSITIONAL_RE) { re.lastIndex = 0; s = s.replace(re, '') }
  return s.trim()
}

/**
 * Scans selector parts from the end and strips positional pseudo-classes
 * from the last part that contains one.
 * "main > div:nth-child(3) > p:nth-child(1)" → "main > div:nth-child(3) > p"
 */
function makeSiblingSelector(selector: string): string {
  const parts = selector.split(/\s*>\s*/)
  for (let i = parts.length - 1; i >= 0; i--) {
    if (hasPositional(parts[i])) {
      const next = [...parts]
      next[i] = stripAllPositional(parts[i])
      return next.join(' > ')
    }
  }
  return selector
}
