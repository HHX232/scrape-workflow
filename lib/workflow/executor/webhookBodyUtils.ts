// Готовит тело запроса для DeliverViaWebhookExecutor. Источник может быть:
//  - обычным JSON-объектом/массивом в виде строки
//  - JSON, завёрнутым в JSON (двойной/тройной JSON.stringify где-то выше по цепочке)
//  - ответом AI-блока, который оборачивает JSON в markdown code fence
//    (```json ... ``` или просто ``` ... ```), часто вперемешку с текстом
//    ("========== IMPORT PRODUCT ==========\ncommand: ```json\n{...}\n```")
//  - произвольным текстом без JSON вообще
//
// Итог всегда один финальный JSON.stringify — либо реального объекта/массива/
// примитива, извлечённого из входа, либо самого текста как JSON-строки, если
// никакого JSON внутри не нашлось.

function extractFromFence(text: string): string | null {
  // Сначала ищем фенс, явно помеченный как json
  const jsonFence = text.match(/```json\s*([\s\S]*?)```/i)
  if (jsonFence && jsonFence[1].trim()) return jsonFence[1].trim()

  // Иначе берём первый фенс любого вида (```\n...\n``` или ```js\n...\n```)
  const anyFence = text.match(/```[a-zA-Z0-9_-]*\s*([\s\S]*?)```/)
  if (anyFence && anyFence[1].trim()) return anyFence[1].trim()

  return null
}

// Сканирует текст слева направо, пробуя каждый встреченный "{" или "[" как
// потенциальное начало JSON-значения. Для каждого кандидата ищет сбалансированную
// пару скобок (с учётом строк и экранирования) и проверяет JSON.parse. Первый
// валидный кандидат побеждает — это отсеивает "ложные" скобки в обычном тексте
// (например "{в наличии}"), которые попадаются раньше настоящего JSON.
function extractFirstJsonValue(text: string): string | null {
  for (let start = 0; start < text.length; start++) {
    const openChar = text[start]
    if (openChar !== '{' && openChar !== '[') continue

    const closeChar = openChar === '{' ? '}' : ']'
    let depth = 0
    let inString = false
    let escapeNext = false
    let matched = false

    for (let i = start; i < text.length; i++) {
      const ch = text[i]

      if (inString) {
        if (escapeNext) escapeNext = false
        else if (ch === '\\') escapeNext = true
        else if (ch === '"') inString = false
        continue
      }

      if (ch === '"') {
        inString = true
        continue
      }
      if (ch === openChar) {
        depth++
      } else if (ch === closeChar) {
        depth--
        if (depth === 0) {
          const candidate = text.slice(start, i + 1)
          try {
            JSON.parse(candidate)
            return candidate
          } catch {
            matched = true // нашли баланс скобок, но это не валидный JSON — пробуем дальше
          }
          break
        }
      }
    }

    if (matched) continue
  }
  return null
}

// Достаёт "сырой" JSON-текст из входной строки: сначала пробует markdown-фенс,
// затем — саму строку целиком, затем — первый валидный JSON-фрагмент внутри
// произвольного текста. Если ничего не найдено — возвращает исходную строку.
export function extractJsonPayload(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed

  const fenced = extractFromFence(trimmed)
  if (fenced) return fenced

  try {
    JSON.parse(trimmed)
    return trimmed
  } catch {
    // не JSON целиком — попробуем найти JSON-фрагмент внутри текста ниже
  }

  return extractFirstJsonValue(trimmed) ?? trimmed
}

// Разворачивает вложенные JSON-строки (JSON, завёрнутый в JSON N раз) и
// возвращает финальный payload сериализованным ровно один раз.
export function normalizeJsonBody(raw: string): string {
  let value: unknown = raw

  for (let i = 0; i < 5; i++) {
    if (typeof value !== 'string') break

    let parsed: unknown
    try {
      parsed = JSON.parse(value)
    } catch {
      return JSON.stringify(value)
    }

    if (typeof parsed !== 'string') {
      return JSON.stringify(parsed)
    }

    value = parsed
  }

  return JSON.stringify(value)
}

// Полный пайплайн: извлечь JSON из фенса/текста, затем убрать лишние слои обёртки.
export function prepareWebhookBody(raw: string): string {
  return normalizeJsonBody(extractJsonPayload(raw))
}
