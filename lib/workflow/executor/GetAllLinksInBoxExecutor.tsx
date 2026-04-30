import { ExecutionEnviroment } from '@/types/Enviroment'
import * as cheerio from 'cheerio'
import { GetAllLinksInBoxTask } from '../task/GetAllLinksInBoxTask'

export async function GetAllLinksInBoxExecutor(
  enviroment: ExecutionEnviroment<typeof GetAllLinksInBoxTask>
): Promise<boolean> {
  try {
    const html = enviroment.getInput('Html')
    if (!html) {
      enviroment.log.error('input -> Html is not defined')
      return false
    }

    const containerSelector = enviroment.getInput('Container Selector')
    if (!containerSelector) {
      enviroment.log.error('input -> Container Selector is not defined')
      return false
    }

    const baseUrl = enviroment.getInput('Base URL') || ''
    const matchSiblings = enviroment.getInput('Match Siblings') === 'true'

    const $ = cheerio.load(html)

    // Build ordered list of selectors to try
    const candidates: string[] = []
    if (matchSiblings) {
      const stripped = makeSiblingSelector(containerSelector)
      candidates.push(stripped)
      // If stripping changed nothing (no positional found), the original is already generic.
      // If it did change, also add the original as final fallback.
      if (stripped !== containerSelector) candidates.push(containerSelector)
    } else {
      candidates.push(containerSelector)
    }

    // Try each candidate in order; use the first that finds elements
    let container = $(candidates[0])
    let usedSelector = candidates[0]
    for (const sel of candidates.slice(1)) {
      if (container.length > 0) break
      container = $(sel)
      usedSelector = sel
    }

    if (container.length === 0) {
      enviroment.log.info(
        `GetAllLinksInBox: no elements found (tried: ${candidates.join(' → ')}) — returning empty`
      )
      enviroment.setOutput('Links', '[]')
      enviroment.setOutput('Count', '0')
      return true
    }

    const links: string[] = []

    const processHref = (href: string | undefined) => {
      if (!href || href === '#' || href.startsWith('javascript:')) return
      if (baseUrl && !href.startsWith('http://') && !href.startsWith('https://')) {
        try {
          links.push(new URL(href, baseUrl).toString())
        } catch {
          links.push(href)
        }
      } else {
        links.push(href)
      }
    }

    // Standard <a href> links
    container.find('a').each((_: number, el: any) => {
      processHref($(el).attr('href'))
    })

    // Non-anchor elements with href (e.g. fancybox <div href="...">)
    container.find('[href]').not('a').each((_: number, el: any) => {
      processHref($(el).attr('href'))
    })

    // Also check if the container elements themselves have href (when selector targets the items directly)
    container.each((_: number, el: any) => {
      const tag = (el as any).tagName?.toLowerCase()
      if (tag !== 'a') processHref($(el).attr('href'))
    })

    const unique = links.reduce((acc, link) => {
      if (!acc.includes(link)) acc.push(link)
      return acc
    }, [] as string[])

    enviroment.setOutput('Links', JSON.stringify(unique))
    enviroment.setOutput('Count', String(unique.length))
    enviroment.log.info(
      `GetAllLinksInBox: ${unique.length} links via "${usedSelector}"` +
      (matchSiblings && usedSelector !== containerSelector ? ' (sibling mode)' : '')
    )
    return true
  } catch (error: any) {
    enviroment.log.error(`GetAllLinksInBox error: ${error?.message ?? error}`)
    return false
  }
}

// All positional pseudo-classes that indicate a specific child position
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

function hasPositional(part: string): boolean {
  return POSITIONAL_RE.some(re => { re.lastIndex = 0; return re.test(part) })
}

function stripAllPositional(part: string): string {
  let s = part
  for (const re of POSITIONAL_RE) { re.lastIndex = 0; s = s.replace(re, '') }
  return s.trim()
}

/**
 * Scans selector parts from the END and strips positional pseudo-classes
 * from the first part (closest to end) that contains one.
 *
 * Example:
 *   "main > div:nth-child(3) > a"   →  "main > div > a"
 *   "div.grid > div:nth-child(2)"   →  "div.grid > div"
 *   "div.grid > div"                →  "div.grid > div"  (nothing to strip)
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

  // No positional found anywhere — selector is already generic
  return selector
}
